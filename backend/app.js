const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const path = require('path')

const app  = express();

const errorMiddleware = require("./middleware/error")

// config
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({path:"backend/config/config.env"})
}

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(fileUpload());

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute")
const order = require("./routes/orderRoute")
const banners = require("./routes/bannerRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", banners);

app.use(express.static(path.join(__dirname,"../frontend/build")));

app.get("*", (req, res)=>{
    res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"))
})

// Middleware for erroe
app.use(errorMiddleware)

module.exports = app