import mongoose from "mongoose";


const addressSchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  zipcode:   { type: String, required: true },
  country:   { type: String, required: true },
  phone:     { type: String, required: true },
}, { _id: true });

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required:true,
        select: false
    },
    role:{
        type: String,
        enum: ["admin","user"],
        default: "user",
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    addresses: [addressSchema]
},{timestamps: true});


export default mongoose.model("users",userSchema)