import { HumanMessage } from "@langchain/core/messages";
import { createAgent, toolStrategy } from "langchain";
import { StateSchema, StateGraph, START, END, } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { geminiModel, cohereModel, ollamaModel } from "./models.service.js";
import { z } from "zod";

const JudgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
    solution_1_reasoning: z.string(),
    solution_2_reasoning: z.string(),
});

const State = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: JudgeSchema.default({
        solution_1_score: 0,
        solution_2_score: 0,
        solution_1_reasoning: "",
        solution_2_reasoning: "",
    }),
});


const solutionNode: GraphNode<typeof State> = async (state) => {

    const [gemini_solution, cohere_solution] = await Promise.all([
        geminiModel.invoke(state.problem),
        cohereModel.invoke(state.problem)
    ])

    return {
        solution_1: gemini_solution.text,
        solution_2: cohere_solution.text
    }
}

const judgeNode: GraphNode<typeof State> = async (state) => {

    const { problem, solution_1, solution_2 } = state;

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
                - Give each solution an independent score from 0 to 10.`
    })


    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(
                `Problem: ${problem}
                Solution 1: ${solution_1}
                Solution 2: ${solution_2}
                
                Evaluate both solutions`

            )
        ]
    })

    return {
        judge: judgeResponse.structuredResponse
    }
}

const graph = new StateGraph(State)
    .addNode("Solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "Solution")
    .addEdge("Solution", "judge_node")
    .addEdge("judge_node", END)
    .compile()

export default async function (problem: string) {
    const result = await graph.invoke({ problem })

    console.log(result)

    return {
        solution_1: result.solution_1,
        solution_2: result.solution_2,
        judge_recommendation: result.judge,
    };
}