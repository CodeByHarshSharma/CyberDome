import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END, } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";

const State = new StateSchema({
    messages: MessagesValue,
})

const solutionNode: GraphNode<typeof State> = (state:typeof State) => {
    console.log(state.messages)
}

const graph = new StateGraph(State)
    .addNode("Solution", solutionNode)