import bcrypt from "bcryptjs";
import User from "../models/User.js";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      status: "active",
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};