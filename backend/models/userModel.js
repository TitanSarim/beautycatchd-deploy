const mongoose = require('mongoose');
const validator  = require("validator");
const bcrypt = require("bcryptjs");
const jwt  = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    
    name:{
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name Cannot Exceed 30 Characters"],
        minLength: [4, "Name Cannot Exceed 30 Characters"],
    },
    email:{
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },

    password:{
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password Should be greater then 8 Characters"],
        // validate: {
        //     validator: validator.isStrongPassword,
        //     message: "Passoword must be a combination of Capital, Small, Numerical & Special Characters",
        // },
    },

    avatar:{
            public_id:{
                type: String,
                required:true
            },
            url:{
                type: String,
                required:true
            }
    },

    role: {
        type: String,
        default: "user",
    },

    createdAt: {
        type: Date,
        default: Date.now,
      },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
});

userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

// JET TOKEN;
userSchema.methods.getJWTToken = function (){
    
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    })

}

// compare password

userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password, this.password);

}   

// reset password
userSchema.methods.getResetPasswordToken = function(){


    // generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing alogrithm sha256
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 *1000;

    return resetToken;

}


module.exports = mongoose.model("User", userSchema);