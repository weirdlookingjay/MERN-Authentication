import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      trim: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please add a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
    },
    photo: {
      type: String,
      default: "https://robohash.org/mail@ashallendesign.co.uk",
    },
    bio: {
      type: String,
      default: "I am a new user",
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
