import express from 'express';
import useGraph from './services/graph.service.js'
import cors from 'cors';

const app = express()
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}))
app.use(express.static('./public'))

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.post("/invoke", async (req, res) => {
    const input = req.body?.input

    if (typeof input !== "string" || !input.trim()) {
        return res.status(400).json({
            success: false,
            message: "Input is required"
        })
    }

    try {
        const result = await useGraph(input.trim())

        res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        })
    }
    catch (error) {
        console.error("Graph execution failed:", error)

        res.status(500).json({
            success: false,
            message: "Something went wrong while running the arena"
        })
    }
})

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `No route for ${req.method} ${req.originalUrl}`
    })
})

export default app