import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { OpenAI } from "@langchain/openai";
import { ChatCohere } from "@langchain/cohere";
import config from '../config/config.js'

export const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    apiKey: config.GOOGLE_API_KEY
})

export const gptModel = new OpenAI({
    model: "gpt-4o-mini",
    apiKey: config.OPENAI_API_KEY
})

export const cohereModel = new ChatCohere({
    model: "north-mini-code-1-0",
    apiKey: config.COHERE_API_KEY
})