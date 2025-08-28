import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/User.js";
import { generateToken } from "./generateToken.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey); //rate Limit
    if (rateLimit) {
        res.status(429).json({
            message: "Too manu request. Please wait"
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); //Generating otp
    const otpKey = `otp:${email}`; // storing otp to redis 
    await redisClient.set(otpKey, otp, {
        EX: 300,
    });
    await redisClient.set(rateLimitKey, "true", {
        EX: 60
    });
    const message = {
        to: email,
        subject: "Your OTP is",
        body: `Your OTP is ${otp}, valid for 5 minutes`
    };
    await publishToQueue("send-otp", message);
    res.status(200).json({
        message: "OTP send to your mail"
    });
});
export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enterdOTP } = req.body;
    if (!email || !enterdOTP) {
        res.status(400).json({
            message: "Email and OTP required "
        });
        return;
    }
    const otpKey = `otp:${email}`;
    const storedOTP = await redisClient.get(otpKey);
    if (!storedOTP || storedOTP !== enterdOTP) {
        res.status(400).json({
            message: "Invalid OTP or extired OTP"
        });
        return;
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 8);
        user = await User.create({ name, email });
    }
    const token = generateToken(user);
    res.json({
        message: "User Verified",
        user,
        token
    });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
export const updateName = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            message: "User not found"
        });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        messgae: "User updated",
        user,
        token
    });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
export const getAUser = TryCatch(async (req, res) => {
    const users = await User.findById(req.params.id);
    res.json(users);
});
