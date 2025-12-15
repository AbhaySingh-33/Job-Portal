import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import { instance } from "../index.js";
import crypto from "crypto";

export const checkOut = TryCatch(async(req:AuthenticatedRequest, res )=>{
    if(!req.user){
        throw new ErrorHandler("No valid user",401);
    }

    const user_id = req.user.user_id;

    const [user] = await sql `SELECT * FROM users WHERE user_id = ${user_id}`;
    if(!user){
        throw new ErrorHandler("User not found",404);
    }

    const subTime = user.subscription
    ? new Date(user.subscription).getTime() : 0;

    const now = Date.now();

    const isSubscribed = subTime > now;

    if(isSubscribed){
        throw new ErrorHandler("User already have a subscription",400);
    }

    const options = {
        amount: Number(119 * 100),
        currency: "INR",
        notes: {
            user_id: user_id.toString(),
        }
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        order,
    });
})

export const paymentVerification = TryCatch(async(req: AuthenticatedRequest,res)=>{
    const user = req.user;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(sign.toString())
    .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if(!isAuthentic){
        throw new ErrorHandler("Payment failed",400);
    }

    if(isAuthentic){
        const now = new Date().getTime();

        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        const expiryDate = new Date(now + thirtyDays);

        const [updatedUser] = await sql `
            UPDATE users
            SET subscription = ${expiryDate}
            WHERE user_id = ${user?.user_id}
            RETURNING *
        `;

        res.status(200).json({
            success: true,
            updatedUser,
        });
    
    }
})