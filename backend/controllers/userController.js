const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User  = require("../models/userModel");
const sendToken  = require("../utils/jwtToken");
const sendEmail  = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a user
exports.registerUser = catchAsyncError (async(req, res, next) =>{

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

    const {name, email, password} = req.body;

    const user = await User.create({
        name, email, password,

        avatar:{
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        }
    });
    
    sendToken(user, 201, res);
});


// LOGIN USER
exports.loginUser = catchAsyncError(async(req, res, next) =>{

    const {email, password} = req.body;

    // checking if user has giver password and email both
    if(!email || !password){
        return next(new ErrorHander("Please enter email and password", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHander("Envalid email or password", 401));
    }

    // if password not matched
    const isPasswordMatched =await user.comparePassword(password);
    
    if(!isPasswordMatched){
        return next(new ErrorHander("Envalid email or password", 401));
    }

    // if password matched

    sendToken(user, 200, res)


})

// logout User
exports.logout = catchAsyncError (async(req, res, next) =>{

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    });

});

// forgot password
exports.forgotPassword = catchAsyncError (async(req, res, next) =>{

    const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }

});

// reset password
exports.resetPassword = catchAsyncError (async(req, res, next) =>{

    // hashing comming token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user  =await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt: Date.now()},
    });

    if (!user) {
      return next(new ErrorHander("Reset password Token is Invalid or has been expired", 404));
    }

    if(req.body.password !== req.body.confirmPassword){
      return next(new ErrorHander("Password Doesnot matched", 404))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    sendToken(user, 200, res);

});


// Get User Detail
exports.getUserDetails = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});


// Updatre User Password
exports.updateUserPassword= catchAsyncError(async (req, res, next) => {
  
  const user = await User.findById(req.user.id).select("+password");

  // if password not matched
  const isPasswordMatched =await user.comparePassword(req.body.oldPassword);
    
  if(!isPasswordMatched){
      return next(new ErrorHander("Old password is Incorrect", 400));
  }

  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHander("password doesnot match", 400));
  }

  // if password match
  user.password = req.body.newPassword;

  await user.save()

  sendToken(user, 200, res)
  
});

// Update User Profile
exports.updateUserProfile= catchAsyncError(async (req, res, next) => {
  
  const newUserData = {
    name: req.body.name,
    email: req.body.email,

  }

  if(req.body.avatar !== ""){
    const user = await User.findById(req.user.id);

    const imageId  = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    user
  })
  
});

// get all users 
exports.getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
      success: true,
      users
    })

})


// get all users detials --admin if admin want to knaow any user details
exports.getSingleUser = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorHander(`User didnt exist with id ${req.params.id}`))
  }

  res.status(200).json({
    success: true,
    user,
  })

})




// Update User to admin --Admin
exports.updateUserRole= catchAsyncError(async (req, res, next) => {
  
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,

  }

  await User.findByIdAndUpdate(req.params.id, newUserData,{
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
 

  res.status(200).json({
    success: true,
  })
  
});




// Delete User to admin role --admin
exports.DeleteUser= catchAsyncError(async (req, res, next) => {

  const user  = await User.findById(req.params.id)

  

  if(!user){
    return next(new ErrorHander(`User doesnot Exist with ID: ${req.params.id}`))
  }

  // remove cloudinary 
  const imageId  = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfullt",
    user
  })
  
});