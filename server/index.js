import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.get('/',(req,res)=>{
    res.send("Hello")
})

app.listen(3000,()=>{
    console.log("server running at 3000")
})