import app from './src/app.js'

const PORT = Number(process.env.PORT) || 300

app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})