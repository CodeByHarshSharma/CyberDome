import express from 'express';
import useGraph from './services/graph.service.js'
import cors from 'cors';
import path from 'path';

const app = express()
app.use(express.json())
app.use(express.static('./public'))
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}))


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    })
})

app.use('*name', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
})

app.post("/invoke", async (req, res) => {
    const { input } = req.body

    try {
        const result = await useGraph(input.trim())

        res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        })
    }
    catch (error) {
        console.error("Graph executed successfully:", error)

        res.status(500).json({
            success: false,
            message: "Something went wrong while running the arena"
        })
    }
})

app.use('*name', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/public/index.html"))
})

export default app