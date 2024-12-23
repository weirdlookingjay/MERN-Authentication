import express from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  loginUser,
  logOutUser,
  registerUser,
  resetPassword,
  updateUser,
  userLoginStatus,
  verifyEmail,
  verifyUser,
} from "../controllers/auth/userController.js";
import {
  adminMiddleware,
  creatorMiddleware,
  protect,
} from "../middleware/authMiddleware.js";
import {
  deleteUser,
  getAllUsers,
} from "../controllers/auth/adminController.js";

const router = express.Router();

// user routes
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);

// admin routes
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);

// Login status
router.get("/login-status", userLoginStatus);

// email verification
router.post("/verify-email", protect, verifyEmail);

// Verify user -> email verification
router.post("/verify-user/:verificationToken", verifyUser);

// forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);

// change password ---> user must be logged in
router.patch("/change-password", protect, changePassword);

export default router;
