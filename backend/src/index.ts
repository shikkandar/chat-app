import express from 'express';
import cookirParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
const app=express();


app.use(cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  }));
  
app.use(express.json())
app.use(cookirParser())
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

const PORT=5001
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}/`);
    
})