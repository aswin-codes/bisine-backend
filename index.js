const express = require("express")
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config();

const corsOptions = {
    origin: ['http://localhost:5173','https://bisinevite.vercel.app'],
    credentials: true ,// Enable credentials (cookies, authorization headers, etc.)
    methods: ["PUT","DELETE","POST","GET"],
    allowedHeaders: ['Content-Type', 'Authorization']
};

const server = express();
const userRouter = require('./Router/user.js');
const shopRouter = require("./Router/shop.js")
const productRouter = require("./Router/product.js")
const reviewRouter = require("./Router/review.js");
const orderRouter = require("./Router/order.js")
const cartRouter = require("./Router/cart.js")
const adminRouter = require("./Router/admin.js")
const searchRouter = require("./Router/search.js")


server.use(express.json());
server.use(cors(corsOptions));
//server.use(cors())
server.get('/test', async (req,res) => {
    res.send({
        msg : "Server is running"
    })
});

// server.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://bisinevite.vercel.app');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });


server.use("/api/user",userRouter);
server.use("/api/shop",shopRouter);
server.use("/api/product",productRouter);
server.use("/api/review",reviewRouter);
server.use("/api/order",orderRouter);
server.use("/api/cart",cartRouter);
server.use("/api/admin",adminRouter);
server.use("/api/search",searchRouter)


server.listen(3000,() => {
    console.log("Server is running on port 3000");
});