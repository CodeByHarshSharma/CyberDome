import { config } from 'dotenv';
config();

type CONFIG = {
    readonly GOOGLE_API_KEY: string;
    readonly OPENAI_API_KEY: string;
    readonly COHERE_API_KEY: string;
}

const config: CONFIG = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    COHERE_API_KEY: process.env.GOOGLE_API_KEY || "",
}

export default config