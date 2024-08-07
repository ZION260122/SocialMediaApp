import express from 'express';
import dotenv from 'dotenv';
import connectDB from './databse/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from '../backend/routes/userRoutes.js'
import postRoutes from '../backend/routes/postRoutes.js'
import {v2 as cloudinary} from 'cloudinary'
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
connectDB();
const app = express()

const PORT = process.env.PORT || 5000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//Middlewares
app.use(express.json({limit: "50mb"})); 
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


//routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/messages", messageRoutes)

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))