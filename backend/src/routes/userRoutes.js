import express from "express";
import {
  getUser,
  loginUser,
  logOutUser,
  registerUser,
  updateUser,
} from "../controllers/auth/userController.js";
import { adminMiddleware, protect } from "../middleware/authMiddleware.js";
import { deleteUser } from "../controllers/auth/adminController.js";

const router = express.Router();

// user routes
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);

// admin routes
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

export default router;
