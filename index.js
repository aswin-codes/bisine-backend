const express = require("express")
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config();


const server = express();
const userRouter = require('./Router/user.js');
const shopRouter = require("./Router/shop.js")
const productRouter = require("./Router/product.js")


server.use(express.json());
server.use(cors());

server.get('/test', async (req,res) => {
    res.send({
        msg : "Server is running"
    })
});

server.use("/api/user",userRouter);
server.use("/api/shop",shopRouter);
server.use("/api/product",productRouter);


server.listen(3000,() => {
    console.log("Server is running on port 3000");
});