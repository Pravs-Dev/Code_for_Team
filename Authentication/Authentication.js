import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
/* istanbul ignore start */
export async function signup(token, role = "student") {
  try {
    // Verify the token using your JWT secret to ensure it's valid
    const _profile = jwt.verify(token, process.env.JWT_SECRET);

    // Extract user details from the token payload
    const user = {
      id: _profile.sub,
      fname: _profile.given_name,
      lname: _profile.family_name,
      email: _profile.email,
      role: role,
    };

    // Check if the user already exists in the database
    let existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      // Return existing user if found
      return existingUser;
    } else {
      // Create a new user if not found
      const newUser = new User(user);
      await newUser.save();
      return newUser;
    }
  } catch (error) {
    console.error("Error during user signup:", error);
    throw error;
  }
}