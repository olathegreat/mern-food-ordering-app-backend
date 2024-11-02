import { Request, Response } from 'express';
import Restaurant from '../models/restaurant';



const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = req.params.restaurantId;
        const restaurant = await Restaurant.findById(restaurantId).lean();

        if (!restaurant) {
            res.status(404).json({ message: "Restaurant not found" });
            return; // Exit after response is sent
        }

        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;

        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCuisines = req.query.cuisines as string || "";
        const sortOption = req.query.sortOption as string || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1;

        let query: any = {};

        query["city"] = new RegExp(city, "i");

        const cityCheck = await Restaurant.countDocuments(query);

        if (cityCheck === 0) {
            res.status(404).json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1
                }
            })
            return;
        }

        if (selectedCuisines) {
            // url = selectedCuisines=italian,burger
            // const cuisinesArray = selectedCuisines.split(',').map((cuisine)=> new RegExp(cuisine, "i"));

            // query["cuisines"] = {$all: cuisinesArray};	    



            const cuisinesArray = selectedCuisines.split(',').map(cuisine => new RegExp(cuisine, "i"));
            query["cuisines"] = { $all: cuisinesArray };

        }
        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
                { restaurantName: searchRegex },
                { cuisines: { $in: [searchRegex] } },
            ]
        }


        const pageSize = 10;

        const skip = (page - 1) * pageSize;


        const restaurants = await Restaurant.find(query).sort({ [sortOption]: 1 }).skip(skip).limit(pageSize).lean()

        const total = await Restaurant.countDocuments(query);

        const response = {
            data: restaurants,
            pagination: {
                total, page,
                pages: Math.ceil(total / pageSize)
            }
        }

        res.json(response);







    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error Fetching Restaurants" })
    }
}


export default {
    searchRestaurant, getRestaurantById
}