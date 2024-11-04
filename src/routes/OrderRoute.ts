import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";


const router = express.Router();

router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, OrderController.createCheckoutSession);

router.post("/checkout/webhook", OrderController.stripeWebhookHandler);
router.get('/', jwtCheck, jwtParse, OrderController.getMyOrders); 

export default router