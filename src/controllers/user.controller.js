import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) => {
   const {fullName,email,username,password} = req.body

   if(
    [fullName,email,username,password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(404,"All fields are required")
   }

  const existedUser = User.findOne({
    $or:[{ username } , { email }]
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath = req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar files is required")
   }

   const avatar = uploadOnCloudinary(avatarLocalPath)
   const coverImage = uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar files is required")
   }

  const user = User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const createdUser = await User.findOne(user._id).select("-password -refreshToken")

   if(!createdUser){
    throw new ApiError(500 , "something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered succesfully")
   )
})

export default registerUser