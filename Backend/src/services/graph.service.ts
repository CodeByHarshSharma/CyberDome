import { HumanMessage } from "@langchain/core/messages";
import { createAgent, toolStrategy } from "langchain";
import { StateSchema, StateGraph, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { geminiModel, cohereModel, ollamaModel } from "./models.service.js";
import { z } from "zod";

const JudgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
    solution_1_reasoning: z.string(),
    solution_2_reasoning: z.string(),
});

type Judge = z.infer<typeof JudgeSchema>;

const State = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    solution_1_failed: z.boolean().default(false),
    solution_2_failed: z.boolean().default(false),
    judge: JudgeSchema.nullable().default(null),
});

function settle(result: PromiseSettledResult<{ text: string }>, label: string) {
    if (result.status === "fulfilled") {
        return { text: result.value.text, failed: false };
    }

    console.error(`${label} failed:`, result.reason);

    return {
        text: `⚠️ **${label} failed to respond.** Please try again.`,
        failed: true,
    };
}

const solutionNode: GraphNode<typeof State> = async (state) => {
    const [gemini, cohere] = await Promise.allSettled([
        geminiModel.invoke(state.problem),
        cohereModel.invoke(state.problem),
    ]);

    const s1 = settle(gemini, "Solution 1");
    const s2 = settle(cohere, "Solution 2");

    return {
        solution_1: s1.text,
        solution_2: s2.text,
        solution_1_failed: s1.failed,
        solution_2_failed: s2.failed,
    };
};

const judgeNode: GraphNode<typeof State> = async (state) => {
    const { problem, solution_1, solution_2, solution_1_failed, solution_2_failed } = state;

    // Nothing to compare if either side failed
    if (solution_1_failed || solution_2_failed) {
        return { judge: null };
    }

    // Randomize order to counter position bias, then map scores back afterwards
    const swapped = Math.random() < 0.5;
    const [first, second] = swapped
        ? [solution_2, solution_1]
        : [solution_1, solution_2];

    const judge = createAgent({
        model: ollamaModel,
        tools: [],
        responseFormat: toolStrategy(JudgeSchema),
        systemPrompt: `You are a strict, impartial evaluator of two AI-generated solutions.

                Evaluate both solutions independently using these criteria:
                1. Correctness and factual accuracy (40%)
                2. Handling of edge cases (25%)
                3. Completeness and adherence to the request (20%)
                4. Clarity and maintainability (15%)

                Rules:
                - Prioritize correctness over length or formatting.
                - Penalize bugs, incorrect technical claims, and missing edge cases.
                - Do not reward extra content if it contains mistakes.
                - A simple, correct solution can score higher than a long, flawed one.
                - Give each solution an independent score from 0 to 10.
                - Order of presentation must not influence your scores.
                - In your reasoning, never refer to a solution by number or position
                  (no "Solution 1", "the first one", etc.). Say "this solution" instead.`,
    });

    try {
        const response = await judge.invoke({
            messages: [
                new HumanMessage(
                    `Problem: ${problem}
                    Solution 1: ${first}
                    Solution 2: ${second}

                    Evaluate both solutions`
                ),
            ],
        });

        const res = response.structuredResponse as Judge;

        const mapped: Judge = swapped
            ? {
                solution_1_score: res.solution_2_score,
                solution_1_reasoning: res.solution_2_reasoning,
                solution_2_score: res.solution_1_score,
                solution_2_reasoning: res.solution_1_reasoning,
            }
            : res;

        return { judge: mapped };
    }
    catch (error) {
        // A judge failure shouldn't throw away two good answers
        console.error("Judge failed:", error);
        return { judge: null };
    }
};

const graph = new StateGraph(State)
    .addNode("Solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "Solution")
    .addEdge("Solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

export default async function (problem: string) {
    const result = await graph.invoke({ problem });

    return {
        solution_1: result.solution_1,
        solution_2: result.solution_2,
        judge_recommendation: result.judge,
    };
}