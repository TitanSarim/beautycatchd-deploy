const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// create product -- Admin
exports.createProduct = catchAsyncError( async(req, res, next) =>{


    let images= [];

    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    const imagesLinks = [];

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        })
    }

    req.body.user = req.user.id;
    req.body.images = imagesLinks;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    })

});

// get all products

exports.getAllProducts = catchAsyncError (async (req, res, ) =>{

    const resultPerPage = 20;
    const productCount = await Product.countDocuments();

    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter();

    let products = await apiFeatures.query;

    let filteredProductsCount = products.length;

    apiFeatures.pagination(resultPerPage);

    products = await apiFeatures.query.clone();

    res.status(200).json({
        success: true,
        products,
        productCount,
        resultPerPage,
        filteredProductsCount,
    })
});




// get all products --(admin)

exports.getAdminProducts = catchAsyncError (async (req, res, ) =>{

   const products = await Product.find()

    res.status(200).json({
        success: true,
        products,
    })
});





// get Single product
exports.getProductDetails = catchAsyncError (async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    
    if(!product){
        return next(new ErrorHander("Product not found ", 404));
    }

    res.status(200).json({
        success: true,
        product
    })

})

// update product -- Admin
exports.updateProduct = catchAsyncError (async (req, res, next) =>{

    let product = await Product.findById(req.params.id);

    if(!product){

        return  next(new ErrorHander("Product not found ", 404));
    }

    //============ images update
    let images= [];

    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images = req.body.images
    }

    if(images !== undefined){
        // remove data from cloudinary
        for(let i= 0; i<product.images.length; i++){
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }


    // update images

    const imagesLinks = [];

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        })
    }

    req.body.images = imagesLinks;

}

   //===================================

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true, 
        runValidators:true, 
        useFindAndModify: false
        }
    );

    res.status(200).json({
        success: true,
        product
    })

});


// delete product --Admin
exports.deleteProduct = catchAsyncError (async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
         return  next(new ErrorHander("Product not found ", 404));
    }

    // remove data from cloudinary
    for(let i= 0; i<product.images.length; i++){
       await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })

});



// Create new Review or Update the review
exports.createProductReview = catchAsyncError (async (req, res, next) => {

    const {rating, comment, productId} = req.body
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewd = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())

    if(isReviewd){

        product.reviews.forEach(rev =>{

            if(rev.user.toString()===req.user._id.toString())
                (rev.rating = rating),
                (rev.comment = comment);
        })

    }else{
        product.reviews.push(review)
        product.numberofReviews = product.reviews.length
    }

    let avg = 0;

    product.reviews.forEach((rev )=> {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
        message: "Review has been submitted"
    })

})

// Get Reviews of a product
exports.getProductReviews = catchAsyncError (async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if(!product){
        return  next(new ErrorHander("Product not found ", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })

})

// delete Review of a product
exports.deleteReview = catchAsyncError (async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if(!product){
        return  next(new ErrorHander("Product not found ", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())

    let avg = 0;

    reviews.forEach((rev )=> {
        avg += rev.rating
    })

    let ratings = 0

    if(reviews.length === 0){
        ratings= 0
    }else{
        ratings = avg / reviews.length;
    }

    

    const numberofReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numberofReviews
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    
    res.status(200).json({
        success: true,
    })

})