import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (userId: string, res: Response) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
		httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
		sameSite: "strict", // Helps prevent CSRF attacks
		secure: process.env.NODE_ENV === "production", // Ensure this is true in production
	});
	

	return token;
};

export default generateToken;