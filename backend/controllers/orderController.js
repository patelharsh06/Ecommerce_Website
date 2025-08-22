import orderSchemas  from '../models/orderSchemas.js';
import productSchema from '../models/productSchemas.js';

export const newOrder = async (req, res) => {
  try {
    // 1) Create the order
    const order = await orderSchemas.create({
      shippingInfo: req.body.shippingInfo,
      user:         req.user._id,
      orderItems:   req.body.orderItems,
      paymentMethod:req.body.paymentMethod,
      paymentInfo:  req.body.paymentInfo,
      itemsPrice:   req.body.itemsPrice,
      taxPrice:     req.body.taxPrice,
      totalAmount:  req.body.totalAmount,
    });

    // 2) Decrement stock for each ordered item
    await Promise.all(
      order.orderItems.map(async item => {
        const product = await productSchema.findById(item.productId);
        if (!product) return;
        // subtract quantity, never go below zero
        product.stock = Math.max(product.stock - item.quantity, 0);
        // skip validation on save since only stock changed
        await product.save({ validateBeforeSave: false });
      })
    );

    // 3) Respond
    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Function to get order details by ID
export const getOrderDetails = async (req, res) => {
    try {
        // Find the order by ID and populate the user field
        const order = await orderSchemas.findById(req.params.id).populate("user", "name email");

        // If the order is not found, return a 404 status code
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Return the order details with a success message
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        // If there is an error, return a 500 status code with an error message
        console.error("Get order details error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Function to get all order of current user
export const myOrders = async (req, res) => {
    try {
        // Find all orders for the current user
        
        const orders = await orderSchemas.find({ user: req.user._id });
        if(!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
            });
        }
        // Return the list of orders with a success message
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        // If there is an error, return a 500 status code with an error message
        console.error("Get my orders error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Function to get all order for admin
export const allOrders = async (req, res) => {
    try {
        // Find all orders for the current user
        
        const orders = await orderSchemas.find();
        if(!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found",
            });
        }
        // Return the list of orders with a success message
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        // If there is an error, return a 500 status code with an error message
        console.error("Getting all orders for admin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Function to get all order for admin
export const updateOrders = async (req, res) => {
    try {
        // Find order by ID and update its status
        
        const order = await orderSchemas.findById(req.params.id);
        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not found for this ID",
            });
        }
        if(order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "You have already delivered this order",
            });
        }
        // Update the order status
        if (req.body.status === "Shipped") {
            for (const item of order.orderItems) {
                // Use the correct product model to find and update the product
                const product = await productSchema.findById(item.productId);
                if (product) {
                    product.stock -= item.quantity;
                    await product.save({ validateBeforeSave: false });
                }
            }
        }

        // Update the order status
        order.orderStatus = req.body.status;
        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        // Return the list of orders with a success message
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        // If there is an error, return a 500 status code with an error message
        console.error("Getting all orders for admin error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}