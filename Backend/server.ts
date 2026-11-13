import app from './src/app.js'

const PORT = Number(process.env.PORT) || 3000

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
    })
}

export default app