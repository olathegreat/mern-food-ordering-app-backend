// OrderController.ts
import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/Order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

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



const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_ENDPOINT_SECRET);
    } catch (err: any) {
        console.log(err);
        res.status(400).send(`web hook error: ${err.message}`);
        return; // Ensure to return here to satisfy the void type
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        order.totalAmount = event.data.object.amount_total ?? 0; // Handle potential null here
        order.status = "paid";

        await order.save();
    }

    res.status(200).send();
};



    const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const checkOutSessionRequest: CheckoutSessionRequest = req.body;
            const restaurant = await Restaurant.findById(checkOutSessionRequest.restaurantId);

            if (!restaurant) {
                res.status(404).json({ message: "Restaurant not found" });
                return;
            }

            const newOrder = new Order({
                restaurant: restaurant._id,
                user: req.userId,
                deliveryDetails: checkOutSessionRequest.deliveryDetails,
                cartItems: checkOutSessionRequest.cartItems,
                // totalAmount: 0,
                status: "placed",
                createdAt: new Date(),
            });

            const lineItems = createLineItems(checkOutSessionRequest, restaurant.menuItems);
            const session = await createSession(lineItems, newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString());

            if (!session.url) {
                res.status(500).json({ message: "Error creating Stripe session" });
                return;
            }

            await newOrder.save();

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

    const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
): Promise<Stripe.Checkout.Session> => {  // specify the return type
  return await STRIPE.checkout.sessions.create({
    payment_method_types: ['card'], // specify payment methods explicitly
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
        createCheckoutSession, stripeWebhookHandler
    };
