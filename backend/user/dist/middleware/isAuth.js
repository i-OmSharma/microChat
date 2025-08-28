import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized! Please login " });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decodedValue = jwt.verify(token, JWT_SECRET);
        //decoded
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Unauthorized! invalid token" });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Please Login - JWT error"
        });
    }
};
