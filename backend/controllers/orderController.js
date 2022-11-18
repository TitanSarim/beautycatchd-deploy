const Order = require("../models/orderModels");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");


// Create new Order
exports.newOrder = catchAsyncError(async (req, res, next) =>{

    const {shippingInfo, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        // paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
      });

    res.status(201).json({
        success: true,
        order,
    })

})


// get single order detials
exports.getSingleOrder = catchAsyncError(async (req, res, next) =>{

    const order= await Order.findById(req.params.id).populate("user", "name email");

    if(!order){
        return next(new ErrorHander("Order not found with this id", 404))
    }

    res.status(201).json({
        success: true,
        order,
    })

});

// get logged in user orders
exports.myOrder = catchAsyncError(async (req, res, next) =>{

    const orders = await Order.find({user: req.user._id})


    res.status(201).json({
        success: true,
        orders,
    })

});

// get All orders --ADMIN
exports.getAllOrders = catchAsyncError(async (req, res, next) =>{

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) =>{
        totalAmount += order.totalPrice;
    });

    res.status(201).json({
        success: true,
        totalAmount,
        orders,
    })

});

// Update order Status --ADMIN
exports.updateOrder = catchAsyncError(async (req, res, next) =>{

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("Order not found with this id", 404))
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("You have Delivered this Order", 400));
    }

    // update stock on status shipping
    if(req.body.status === "Shipped"){

        if (req.body.status === "Shipped"){
            order.orderItems.forEach(async (o) => {
                await updateStock(o.product, o.quantity);
            });
        }
    
    }

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});


    res.status(200).json({
        success: true,
        
    })

});

// update stock status in inventry
async function updateStock (id, quantity){

    const product = await Product.findById(id);

     product.stock -= quantity;

     await product.save({validateBeforeSave: false})

}


// delete order --ADMIN
exports.deleteOrder = catchAsyncError(async (req, res, next) =>{

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("Order not found with this id", 404))
    }

   await order.remove()

    res.status(201).json({
        success: true,
        
    })

});