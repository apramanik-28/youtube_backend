import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js";
import {User} from "../modles/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
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
   console.log("fullName :",fullName)

//    if(fullName===""){
//     throw new ApiError(400,"fullname is required")

//    }
if(
    [fullName,email,username,password].some((field) => field?.trim()==="")
){
    throw new ApiError(400,"All fields are required")
}
const existedUser = User.findOne({
    $or : [{username},{email},]
})
if(existedUser){
    throw new ApiError(409,"user with email or username already exist")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLoclPath = req.file?.coverImage[0].path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLoclPath)

if(!avatar){
    throw new ApiError(400,"Avatar file is required")
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

export {registerUser}