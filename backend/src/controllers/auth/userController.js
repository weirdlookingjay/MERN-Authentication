import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../models/Token.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Check password length
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  // check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // generate token with user id
  const token = generateToken(user._id);

  // send back the user and token in the reponse to the client
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: true,
    secure: true,
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVerified } = user;

    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const userExists = await User.findOne({ email });
  if (!userExists) {
    res.status(400).json({ message: "User does not exist" });
    return;
  }

  const isMatch = await bcrypt.compare(password, userExists.password);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken(userExists._id);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified } = userExists;

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
      secure: true,
    });

    res.status(200).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid email or password" });
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logged out successfully" });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, bio, photo } = req.body;

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Not authorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  let token = await Token.findOne({ userId: user._id });

  // if token exists - delete it
  if (token) {
    await token.deleteOne();
  }

  // create a verification token
  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

  // hash the verification token
  const hashedToken = await hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }).save();

  // Verification Link
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const send_from = process.env.RESEND_EMAIL;
  const send_to = user.email;
  const subject = "Email Verification - AuthKit";
  const reply_to = process.env.RESEND_USER;
  const html = "emailVerification";
  const name = user.name;
  const link = verificationLink;

  try {
    console.log(send_from, send_to);
    await sendEmail(send_from, send_to, subject, reply_to, html, name, link);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log("Error sending email", error);
    return res.status(500).json({ message: "Error sending email" });
  }
});

// verify user
export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid verification token" });
  }

  const hashedToken = await hashToken(verificationToken);

  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }

  const user = await User.findById(userToken.userId);

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }

  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "User verified successfully" });
});

// forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // see if reset token exists
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // create a reset toke using the useer id ---> expires in 24 hours
  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

  // hash the reset token
  const hashedToken = await hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  }).save();

  // reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  // send email to user
  const send_from = process.env.RESEND_EMAIL;
  const send_to = user.email;
  const subject = "Password Reset - AuthKit";
  const reply_to = process.env.RESEND_USER;
  const html = "forgotPassword";
  const name = user.name;
  const link = resetLink;

  try {
    await sendEmail(send_from, send_to, subject, reply_to, html, name, link);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log("Error sending email", error);
    return res.status(500).json({ message: "Error sending email" });
  }
});
