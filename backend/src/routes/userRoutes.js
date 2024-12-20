import express from "express";
import {
  getUser,
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/auth/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user", protect, getUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);

export default router;
