import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup=async(req,res)=>{
    const {fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({success:false, message:"All fields are required"});
        }
        if(password.length<6){
            return res.status(400).json({ success: false,message: "Password must be atleast 6 characters" });
        }
        const existingUser=await User.findOne({email});
        if(existingUser) 
            return res.status(400).json({messsage:"Email already exists"})
        
        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=new User({
            fullName,
            email,
            password:hashedPassword
        });

        await newUser.save();
        generateToken(newUser._id,res);

        res.status(201).json({
            success:true,
            data:{
                _id:newUser.id,
                fullName:newUser.fullName,
                email:newUser.email
            }
        })
    } catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json({success:false,message:"Internal Server error"});
    }
};

export const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await User.findOne({email})
        if(!user) 
            return res.status(400).json({success:false,message:"Invalid username or email"});
        
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect)
            return res.status(400).json({success:false,message:"Invalid password"})
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        });
    } catch(error){
        console.log("Error in login controller",error.message);
        res.status(500).json({success:false,message:"Internal Server Error"});
    }
};

export const logout=async(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    } catch(error){
        console.log("Error in logout controller");
        res.status(500).json({success:false,message:"Internal Server Error"});
    }
};

export const updateProfile=async(req,res)=>{
    try{
        const {profilePic}=req.body;
        const userId=req.user._id;

        if(!profilePic) 
            return res.status(400).json({message:"Profile pic is required"});
        const uploadResponse=await cloudinary.uploader.upload(profilePic);
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
    
        res.status(200).json(updatedUser);
    }catch(error){
        console.log("Error in update profile:",error);
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const checkAuth=(req,res)=>{
    try{
        res.status(200).json(req.user);
    } catch(error){
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}