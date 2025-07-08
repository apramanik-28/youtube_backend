import express from "express"
import cookieParser from "cookie-parser"

const app= express()

app.use(cors({
    origin : process.env.CROS_ORIGIN,
    credentials :true
}))

app.use(express.json({limit:"16KB"}))  //Parses incoming requests with JSON payloads
app.use(express.urlencoded({extended:true,limit : "16KB"})) //Parses incoming requests with URL-encoded payloads (from forms)
app.use(express.static("public"))//Serves static files (like HTML, CSS, JS, images) from the public folde
app.use(cookieParser())

export {app}