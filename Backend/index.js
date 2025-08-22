//importing dotenv to use environment variables
import dotenv from 'dotenv';
// Configuring dotenv to use the config.env file
dotenv.config({path: './config/config.env'});
//importing express from express
import express from 'express';
//importing cookie-parser to parse cookies
import cookieParser from 'cookie-parser';
//importing the database connection function from dbConnect.js
import { connectDB } from './config/dbConnect.js';

//importing cors to handle cross-origin requests
import cors from 'cors';

// Creating an instance of express
const app = express();

//Connecting to the database
connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,})
);

//middleware to parse JSON
app.use(express.json());
app.use(cookieParser())

//importing all routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
app.use("/api/products",productRoutes);
app.use("/api/users",userRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/admin",adminRoutes);


//Listening to port from the environment variable
app.listen (process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});