import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: "Not authorized, please login" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get user details from the token --> exclude password
    const user = await User.findById(decoded.id).select("-password");

    // check if user exists
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // setuser details in the request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, please login" });
  }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    // If user is admin, move to the next middleware/controller
    next();
    return;
  }

  res.status(403).json({ message: "Access denied" });
});
