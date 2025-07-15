/*import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../modles/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import { ApiRsponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req,res)=>{
   //get user details
   //validation - not empty
   //check if user already exist or not
   //check for imags,avatar
   //upload them to cloudnainary
   //create user object-create entry in db
   //remove password and refreshtoken field from response
   //check for user creation
   //return response
   const{fullName,email,username,password}=req.body
  // console.log("fullName :",fullName)

//    if(fullName===""){
//     throw new ApiError(400,"fullname is required")

//    }
if(
    [fullName,email,username,password].some((field) => field?.trim()==="")
){
    throw new ApiError(400,"All fields are required")
}
const existedUser = await User.findOne({
    $or : [{username},{email},]
})
if(existedUser){
    throw new ApiError(409,"user with email or username already exist")
}

const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if (!avatar) {
  throw new ApiError(400, "Avatar upload failed");
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url||"",
    email,
    password,
    username: username.toLowerCase()

})

const createuser = await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createuser){
    throw new ApiError("Something wend wrong while registering the user")
}

return res.status(201).json(
    new ApiRsponse(200,createuser,"user registered succressfully")
)

} )

export {registerUser}*/
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modles/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import {ApiRsponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
//import { res } from "express";


const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()
    user.refreshToken = refreshToken;
    await  user.save({validateBeforeSave : false})

    return {accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"something went wrong while geneate refresh and access token")
    
  }
}





const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;    //extract data points

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }                                                  // check anyone not pass empty string

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],           // chack user already exist or not 
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(req.files);
  

  if (!req.files) {
    throw new ApiError(400, "No files were uploaded");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;         // find local path of avatar and upload it
 // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  
let coverImageLocalPath;
if(req.file && Array.isArray(req.files.coverImage)&& req.file.coverImage.length>0){
  coverImageLocalPath = req.files.coverImage[0].path

}

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    fs.unlinkSync(avatarLocalPath);
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password, //Make sure to hash this in a pre-save hook!
    username: username.toLowerCase(),
  });

  const createUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiRsponse(200, createUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async(req,res)=>{
//req body
//usename.email
//find user
//password check
//access token refresh token
//send cookies

const{email,username,password}=req.body

if(!(username || email)){
  throw new ApiError(400,"username or email required")
}
const user = await User.findOne({
  $or : [{username},{email}]
})
if(!user){
  throw new ApiError(404,"user dose not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password);
if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials");
}


const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

return res.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiRsponse(200,{
    user:loggedInUser,accessToken,refreshToken
  },
  "user logged in successfully"
  )
)

});

const logoutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      refreshToken:undefined
    }
  },
  {
    new : true
  }
)

const options= {
  httpOnly: true,
  secure : true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiRsponse(200,{},"User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{

  const incomeingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomeingRefreshtoken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      
      incomeingRefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"invalid refresh token")
    }
    if(incomeingRefreshtoken!==user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
  
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(
   new ApiRsponse
   (
     200,
    {accessToken,refreshToken : newRefreshToken },
    "Access token refreshed"
   )
  
  )
  
  } catch (error) {
    throw new ApiError(401,error?.messege ||"invalid reresh token")
  }

})




export { registerUser,
  loginUser,
  logoutUser
 };
