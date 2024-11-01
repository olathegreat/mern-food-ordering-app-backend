import express,{Request, Response} from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose";
import {v2 as cloudinary} from "cloudinary" 
import MyRestaurantRoutes from "./routes/MyRestaurantRoutes"    
import myUserRoute from "./routes/MyUserRoutes" 
import RestaurantRoute from "./routes/RestaurantRoute"  




mongoose.connect(process.env.MONGO_CONNECTION_STRING as string).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log(err);
})  

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  
    api_key: process.env.CLOUDINARY_API_KEY,    
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express();
app.use(express.json())
app.use(cors()) 



app.get('/health', async(req:Request, res:Response)=>{
    res.send({
        message: "health okay!"
    })

});
   
app.use('/api/my/user', myUserRoute);
app.use('/api/my/restaurant', MyRestaurantRoutes);
app.use('/api/restaurant', RestaurantRoute)


app.listen(7000, () => {
    console.log('Server is running on port 7000')
})