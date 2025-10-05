import express from 'express'

const app = express()
const PORT = 3000

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Helloworld")
})

app.post('/login', (req, res) => {
    const user = req.body
    const username = user.email.slice(0, user.email.indexOf('@'))
    // const test = 'test'.indexOf
    res.status(200).json({
        message: `Login Successfully!, Welcome ${username}`,
        data: user,
    //     // token
    })
})

app.post('/register', (req, res) => {
    const token = 'token'
    const user = req.body
    res.status(201).json({
        message : "Register Successfully!",
        data: user,
        token
    }
    )
})

app.listen(PORT, () => {
    console.log(`Server Is Running On Port ${PORT}`)
})