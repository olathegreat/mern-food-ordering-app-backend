import mongoose from "mongoose";
import Restaurant from "./restaurant";
import { create } from "domain";

const orderSchema = new mongoose.Schema({

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    deliveryDetails: {
        type: {
            email: String,
            name: String,
            addressLine1: String,
            city: String,
        },
        required: true,
    },
    cartItems: [{
        menuItemId: {
            type: String,
            required: true,

        },
        quantity: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["placed","paid", "inProgress" , "outForDelivery","delivered"],
        
    },
    createdAt: {
        type:Date,
        default: Date.now,  
    }
})


const Order = mongoose.model("Order", orderSchema);

export default Order;