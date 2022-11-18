const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter product Name"],
        trim: true
    },

    description:{
        type: String,
        required: [true, "Please Enter product Description"],
    },

    descriptionA:{
        type: String,
    },

    descriptionB:{
        type: String,
    },

    descriptionC:{
        type: String,
    },

    price:{
        type: Number,
        required: [true, "Please enter product Price"],
        maxLength: [8, "Price Cannot Exceed 8 characters"]
    },

    ratings:{
        type: Number,
        default: 0
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
    category:{
        type: String,
        required: [true, "Please enter product Category"],

    },

    stock:{
        type: Number,
        required: [true, "Please enter product Stock"],
        maxLength: [4, "Stock Cannot exceed 4 Characters"],
        default: 1
    },
    numberofReviews:{
        type: Number,
        default: 0
    },

    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type: String,
                required: true,
            },
            rating:{
                type: Number,
                require: true,
            },
            comment:{
                type: String,
                required: true
            }

        },
        
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

module.exports = mongoose.model("Product", productSchema)