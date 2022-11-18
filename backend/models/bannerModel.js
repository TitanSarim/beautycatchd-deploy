const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({

    name:{
        type: String,
        required: [true, "Please enter Banner Name"],
        trim: true
    },
    
    images:[
        {
            public_id:{
                type: String,
                required:true
            },
            url:{
                type: String,
                required:true
            }
        }
    ],

    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Banner", bannerSchema)