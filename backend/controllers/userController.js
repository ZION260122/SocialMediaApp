import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import generateTokensAndSetCookie from "../utils/helpers/generateTokensAndSetCookie.js";

//signin User
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokensAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

//login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password
    );
    if (!user || !isPasswordCorrect) {
      res.status(400).json({ message: "Invalid username or password" });
    }
    
    generateTokensAndSetCookie(user._id, res);
    res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,

    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in loginUser ", err.message);
  }
};

export { signupUser, loginUser };
