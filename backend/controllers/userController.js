import User from "../models/userModels.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokensAndSetCookie from "../utils/helpers/generateTokensAndSetCookie.js";
import {v2 as cloudinary} from 'cloudinary'
import mongoose from "mongoose"; 

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

    //password should be null in response

    if (newUser) {
      generateTokensAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic
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
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokensAndSetCookie(user._id, res);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      profilePic: user.profilePic
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in loginUser ", err.message);
  }
};

//logout user
const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in logoutUser ", err.message);
  }
};

//follow and unfollow users

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, username, email, password, bio } = req.body;
  let {profilePic} = req.body;

  const userId = req.user._id.toString(); // Ensure string

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if(profilePic){
      if(user.profilePic){
        await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split('.')[0]);
      }
      
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    //update user details
    user.email = email || user.email;
    user.name = name || user.name;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    //save updated user
    user = await user.save();

    // update replies where user has replies
    await Post.updateMany(
      {"replies.userId": userId},
      {
        $set: {
          "replies.$[reply].username" : user.username,
          "replies.$[reply].userProfilePic" : user.profilePic,
        }
      },
      {arrayFilters: [{"reply.userId" : userId}]}
    )


    res.status(200).json({ message : "profile updated Successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in update the profile: ", err.message);
  }
};

const getUserProfile = async (req, res) => {
  const {query} = req.params;
  //we will fetch user profile either with username or userId
  //query is either gonna be username or useId
  try {
    let user;
if(mongoose.Types.ObjectId.isValid(query)){
      user = await User.findOne({_id: query}).select("-password").select("-updatedAt")
    }else {
      //query is username
      user = await User.findOne({username: query}).select("-password").select("-updatedAt")
    }


    if(!user) return res.status(400).json({error: "User not found"});

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error : err.message });
    console.log("Error in getting User Profile: ", err.message);
  }
}

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile };
