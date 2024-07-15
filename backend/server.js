import express from 'express';
import dotenv from 'dotenv';
import connectDB from './databse/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from '../backend/routes/userRoutes.js'

dotenv.config();
connectDB();
const app = express()

const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//routes
app.use("/api/users", userRoutes)

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))