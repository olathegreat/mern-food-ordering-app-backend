// OrderController.ts
import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

type CheckoutSessionRequest = {
    cartItems: {
        menuItemId: string;
        name: string;
        quantity: string;
    }[];
    deliveryDetails: {
        email: string;
        name: string;
        addressLine1: string;
        city: string;
    };
    restaurantId: string;
};

const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const checkOutSessionRequest: CheckoutSessionRequest = req.body;
        const restaurant = await Restaurant.findById(checkOutSessionRequest.restaurantId);

        if (!restaurant) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }

        const lineItems = createLineItems(checkOutSessionRequest, restaurant.menuItems);
        const session = await createSession(lineItems, "TEST_ORDER_ID", restaurant.deliveryPrice, restaurant._id.toString());

        if (!session.url) {
            res.status(500).json({ message: "Error creating Stripe session" });
            return;
        }

        res.json({ url: session.url });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: err?.raw?.message || err.message || "Internal Server Error" });
    }
};

const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: MenuItemType[]) => {
    return checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString());

        if (!menuItem) {
            throw new Error(`Menu Item not found: ${cartItem.menuItemId}`);
        }

        return {
            price_data: {
                currency: 'usd',
                unit_amount: menuItem.price,
                product_data: {
                    name: menuItem.name,
                },
            },
            quantity: parseInt(cartItem.quantity, 10),
        };
    });
};

const createSession = async (lineItems: Stripe.Checkout.SessionCreateParams.LineItem[], orderId: string, deliveryPrice: number, restaurantId: string) => {
    return await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "usd",
                    },
                },
            },
        ],
        mode: "payment",
        metadata: {
            orderId,
            restaurantId,
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });
};

export default {
    createCheckoutSession,
};
