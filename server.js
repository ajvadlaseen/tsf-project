import express from 'express'
import routes from './routes.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static('./public/'))

app.use('/data', routes)

app.use((req, res) => {
    res.status(404)
    res.send('<h1>Not Found</h1>')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log('Server Running')
})
