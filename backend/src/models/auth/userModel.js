import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

// hash the password
UserSchema.pre("save", async function (next) {
  // check if the password is modified
  if (!this.isModified("password")) {
    return next();
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  // call the next middleware
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
