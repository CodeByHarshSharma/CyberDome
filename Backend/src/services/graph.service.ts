import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { createAgent, toolStrategy } from "langchain";
import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END, } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { geminiModel, cohereModel, ollamaModel } from "./models.service.js";
import { z } from "zod";

const JudgeSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
});


const State = new StateSchema({
    messages: MessagesValue,
    solution_1: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => {
            return next
        }
    }),
    solution_2: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => {
            return next
        }
    }),
    judge_recommendation: new ReducedValue(
        JudgeSchema.default({
            solution_1_score: 0,
            solution_2_score: 0,
        }),
        {
            reducer: (current, next) => next,
        }
    )
})

const getQuestion = (messages: BaseMessage[]) => {
    const question = messages[0]?.text;
    if (!question) throw new Error("No user message in state");
    return question;
};

const solutionNode: GraphNode<typeof State> = async (state) => {

    const question = getQuestion(state.messages)

    const [gemini_solution, cohere_solution] = await Promise.all([
        geminiModel.invoke(question),
        cohereModel.invoke(question)
    ])

    return {
        solution_1: gemini_solution.text,
        solution_2: cohere_solution.text
    }
}

const judgeNode: GraphNode<typeof State> = async (state) => {

    const question = getQuestion(state.messages)

    const { solution_1, solution_2 } = state;

    const judge = createAgent({
        model: ollamaModel,
        tools: [],
        responseFormat: toolStrategy(JudgeSchema)
    })


    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(
                `You are a strict, impartial evaluator of two AI-generated solutions.
                Problem: ${question}
                Solution 1: ${solution_1}
                Solution 2: ${solution_2}

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
            )
        ]
    })

    const result = judgeResponse.structuredResponse

    return {
        judge_recommendation: result
    }
}

const graph = new StateGraph(State)
    .addNode("Solution", solutionNode)
    .addNode("judge", judgeNode)
    .addEdge(START, "Solution")
    .addEdge("Solution", "judge")
    .addEdge("judge", END)
    .compile()

export default async function (userMessage: string) {
    const result = await graph.invoke({
        messages: [new HumanMessage(userMessage)]
    })

    console.log(result)

    return {
        solution_1: result.solution_1,
        solution_2: result.solution_2,
        judge_recommendation: result.judge_recommendation,
    };
}