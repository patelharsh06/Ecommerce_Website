//importing mongoose to create schema
import mongoose from "mongoose";

// Creating a product schema using mongoose
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: [true, "Please enter product name"],
        maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [5, "Product name cannot exceed 5 digits"],
    },
    description: {
        type: String,
        required: [true, "Please enter product Description"],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please select product category"],
        enum: {
            values: [
                "Electronics",
                "Cameras",
                "Laptops",
                "Accessories",
                "Headphones",
                "Food",
                "Books",
                "Sports",
                "Outdoor",
                "Home",
            ],
            message: "Please select correct category for product"
        }
    },
    seller:
    {
        type: String,
        required: [true, "Please enter product seller"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxLength: [5, "Product stock cannot exceed 5 digits"],
        default: 1
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: false
            },
            name: {
                type: String,
                required: false
            },
            rating: {
                type: Number,
                required: false
            },
            comment: {
                type: String,
                required: false
            }
        }
    ],
    isFeatured: {
        type:Boolean,
        default:false
    }
    
},
{ timestamps: true }
);    

export default mongoose.model("Products", productSchema);