import { Request, Response } from "express";
import User from "../models/user";

const createCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { auth0Id } = req.body;
        const existingUser = await User.findOne({ auth0Id });
        if (existingUser) {
            res.status(200).json({ message: "User already exists", user: existingUser });
            return;
        }

        const newUser = await User.create(req.body);
        res.status(201).json(newUser.toObject());
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error creating the user" });
    }
};

const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { auth0Id, name, addressLine1, country, city } = req.body;
        const existingUser = await User.findById(req.userId);
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        existingUser.name = name;
        existingUser.addressLine1 = addressLine1;
        existingUser.country = country;
        existingUser.city = city;
        await existingUser.save();

        res.json(existingUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error Updating User" });
    }
};

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = await User.findOne({ _id: req.userId });
        if (!currentUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(currentUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error getting the user" });
    }
};

export default {
    createCurrentUser,
    updateCurrentUser,
    getCurrentUser,
};
