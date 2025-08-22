import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        zipcode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users",
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "products",
            },
        },
    ],
    paymentMethod: {
        type: String,
        required: true,
        enum:
        {
            values: ["cod", "card", "upi"],
            message: "Please select a valid payment method",
        } 
    },
    paymentInfo: {
        id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        default: "Ordered",
        enum: {
            values: ["Ordered", "Shipped", "Delivered", "Cancelled"],
            message: "Please select a valid order status",
        },
    },
    deliveredAt: {
        type: Date,
    }
    
},
{timestamps: true}
);

export default mongoose.model("orders", orderSchema);