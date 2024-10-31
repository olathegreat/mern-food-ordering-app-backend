import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";


const getMyRestaurant = async (req: Request, res: Response) => {   
    try{
         const restaurant = await Restaurant.findOne({
            user: req.userId
        })  ;
        if(!restaurant){
            res.status(404).json({ message: "Restaurant not found" })
            return;
        }   
        res.status(200).json({ restaurant })    
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error Fetching Restaurant" })  
    }
 }
const createMyRestaurant = async (req: Request, res: Response) => {

    try {

        const existingRestaurant = await Restaurant.findOne({
            user: req.userId
        })

        if (existingRestaurant) {
            res.status(409).json({ message: "Restaurant already exists" })
            return;

        }

        req.body.cuisines = typeof req.body.cuisines === 'string' ? JSON.parse(req.body.cuisines) : req.body.cuisines;
        req.body.menuItems = typeof req.body.menuItems === 'string' ? JSON.parse(req.body.menuItems) : req.body.menuItems;
        

        // const image = req.file as Express.Multer.File;
        // const base64Image = Buffer.from(image.buffer).toString("base64");
        // const dataURI = `data:${image.mimetype};base64,${base64Image}`;
        // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const imageUrl = await uploadImage(req.file as Express.Multer.File);    

        const restaurant = new Restaurant(req.body);    
      

        restaurant.imageUrl = imageUrl;
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();

        await restaurant.save();


        res.status(201).json({restaurant});
        
    } catch (err) {

        console.log(err);
        res.status(500).json({ message: "Error creating the restaurant" })
    }
}

const updateMyRestaurant = async(req:Request, res:Response)=>{
      try{
        
             const restaurant = await Restaurant.findOne({
                user: req.userId
             })
             if(!restaurant){
                res.status(404).json({ message: "Restaurant not found" })
                return;
             }  
             restaurant.restaurantName = req.body.restaurantName;   
             restaurant.city = req.body.city;
             restaurant.country = req.body.country;
             restaurant.deliveryPrice = req.body.deliveryPrice;
             restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
             restaurant.cuisines = req.body.cuisines;
             restaurant.menuItems = req.body.menuItems; 
             restaurant.lastUpdated = new Date();   

             if(req.file){
                const imageUrl = await uploadImage(req.file as Express.Multer.File);   
                restaurant.imageUrl = imageUrl; 
             }

             await restaurant.save();
             res.status(200).send(restaurant);




      }catch(err){
        console.log(err)
        res.status(500).json({ message: "Error updating the restaurant" })
      }
}

const uploadImage = async(file:Express.Multer.File)=>{
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    return uploadResponse.url;

}
export default {
  getMyRestaurant,  createMyRestaurant, updateMyRestaurant
}   