import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatCohere } from "@langchain/cohere";
import config from '../config/config.js'

export const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    apiKey: config.GOOGLE_API_KEY
})

export const ollamaModel = new ChatOllama({
    model: "gemma4:31b-cloud",
    baseUrl: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${config.OLLAMA_API_KEY}`
    }
})

export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY
})