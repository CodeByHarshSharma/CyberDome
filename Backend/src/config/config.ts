import { config } from 'dotenv';
config();

type CONFIG = {
    readonly GOOGLE_API_KEY: string;
    readonly OLLAMA_API_KEY: string;
    readonly COHERE_API_KEY: string;
}

const app_config: CONFIG = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY || "",
    COHERE_API_KEY: process.env.COHERE_API_KEY || "",
}

export default app_config