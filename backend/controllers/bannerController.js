const Banner = require("../models/bannerModel")
const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const cloudinary = require("cloudinary");


// create Banner -- Admin
exports.createBanner = catchAsyncError( async(req, res, next) =>{


    let images= [];

    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    const imagesLinks = [];

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder: "banners",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        })
    }

    req.body.user = req.user.id;
    req.body.images = imagesLinks;

    const banner = await Banner.create(req.body);

    res.status(201).json({
        success: true,
        banner,
    })

});

// get all banners

exports.getBanner = catchAsyncError (async (req, res) =>{

    const banners = await Banner.find();

    res.status(200).json({
        success: true,
        banners,
    })
});


// get all banner --(admin)

exports.getAdminBanner = catchAsyncError (async (req, res, ) =>{

    const banners = await Banner.find()
 
     res.status(200).json({
         success: true,
         banners,
     })
 });

// delete banner --Admin
exports.deleteBanner = catchAsyncError (async (req, res, next) => {

    const banner = await Banner.findById(req.params.id);

    if(!banner){
         return  next(new ErrorHander("Banner not found ", 404));
    }

    // remove data from cloudinary
    for(let i= 0; i<banner.images.length; i++){
       await cloudinary.v2.uploader.destroy(banner.images[i].public_id);
    }

    await Banner.remove();

    res.status(200).json({
        success: true,
        message: "banner deleted successfully"
    })

});
