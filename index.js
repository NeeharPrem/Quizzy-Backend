import dotenv from "dotenv";
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
const monguri = process.env.MONGO_URI;
import admin_routes from './routes/admin_routes.js'
import user_routes from './routes/user_routes.js';
import morgan from 'morgan'

const app = express();
const port = 3000;
const corsUrl = process.env.CORS_URL

app.use(cors({ origin: corsUrl ,credentials:true}))
app.use(morgan('dev'))
app.options("*", cors());
app.use(express.json());
app.use('/',user_routes)
app.use('/admin',admin_routes)

mongoose.connect(monguri)
    .then(() => {
        console.log('connected to mongoDB');
    })
    .catch((err) => {
        console.error('error during connecting to mongoDB', err)
    })


app.listen(port,()=>{
    console.log('connected')
})