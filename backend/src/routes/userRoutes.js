import express from "express";
import {
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/auth/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);

export default router;
