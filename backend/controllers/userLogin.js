// importing jwt generation and decoding functions
import { jwtGenerator,jwtDecoder } from "../middleware/jwtEncodeDecode.js";
// importing user model schema
import userModel from "../models/userModelSchemas.js";
import orderSchemas from "../models/orderSchemas.js"
// importing bcrypt for password hashing
import bcrypt from 'bcrypt';
// Function to register a new user
export const userRegister = async (req,res) => {
    try{
        if(!req.body.name || !req.body.email || !req.body.password){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }
        
        else {
            // Check if the user already exists
            const existingUser = await userModel.findOne({email: req.body.email});
            // If user exists, return error message
            if(existingUser){
                res.status(400).json({
                    success: false,
                    message: "User already exists",
                });   
            }
            // If user does not exist, hash the password and create a new user
            const password = req.body.password;
            const hashedPassword = await bcrypt.hash(password,12);
            // Create a new user with the hashed password
            const userDetails = new userModel({...req.body,password:hashedPassword});
            // Save the user to the database
            await userDetails.save();
            // Return success message
            res.status(201).json({
                success: true,
                message: "Registration successful",
            });
        }
    }
    catch(err){
        // if any error occurs during registration, log the error and return a 500 status code
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Function to login a user
export const userLogin = async (req,res) => {
    try{
        // Extract email and password from request body
        const {email, password} = req.body;

        if(email === process.env.ADMIN_EMAIL ){
            if(password === process.env.ADMIN_PASSWORD){
                const token = jwtGenerator({id: process.env.ADMIN_ID, role: "admin"});
                return res.status(200).cookie('token', token, {
                    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
                    httpOnly: true
            }).json({
                    success: true,
                    message: "Admin login successful",
                    token: token,
                    user: {
                        id: process.env.ADMIN_ID,
                        role: "admin"
                    }
                });
            } else {
                return res.status(401).json({message: "Invalid Admin E-mail or password"});
        }
    }
        // Check if email and password are provided
        const user = await userModel.findOne({email}).select("+password");
        // If user is not found, return error message
        if(!user){
            return res.status(401).json({message: "Invalid E-mail or password"});
        }
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password,user.password);
        // If password is invalid, return error message
        if(!isPasswordValid){
            return res.status(401).json({ message: "Invalid Email or password"});
        }
        // If password is valid, generate a JWT token
        const token = jwtGenerator({id: user._id, role: user.role});
        
        // Return success message and token as a cookie
        // Set the token in a cookie with a 1-day expiration and httpOnly flag
        res.status(200).cookie('token', token, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }).json({
            success: true,
            message: "Login successful",
            token: token,
            user: user,
        });
    }
    catch(err){
        // If there is an error during login, log the error and return a 500 status code
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Function to login a user
export const userLogout = async (req,res) => {
    try{
        // Clear the token cookie to log out the user
        res.cookie("token",null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        // Return success message
        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    }
    catch(err){
        // If there is an error during logout, log the error and return a 500 status code
        console.error("Logout error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


export const getUserProfile = async (req,res) => {
    try{
        if(req.user.role === 'admin'){
            return res.status(200).json({
                success: true,
                message: "Admin profile access",
                user: {
                    id: req.user._id,
                    role: 'admin',
                    name: 'Admin User',
                }
            })
        }

        // Find the user by ID from the request object
        const user = await userModel.findById(req.user._id);
        // If user is not found, return 404
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Return user profile data
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch(err){
        // If there is an error while fetching the user profile, log the error and return a 500 status code
        console.error("Profile fetch error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const updateUserProfile = async (req,res) => {
    try{
        const { name, email } = req.body;
        const user = await userModel.findById(req.user._id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        await user.save();


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: user.toObject(),
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// --- Update User Password ---
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide old and new passwords." });
        }

        // Find the user and include their password for comparison
        const user = await userModel.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the old password is correct
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect old password" });
        }

        // Hash the new password and save it
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// --- Admin: Get all users ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find(); // Find all documents in the users collection
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this ID",
            });
        }

        // Here you might add logic to also delete user's orders, reviews, etc.
        // For now, we will just delete the user document.
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getUserCart = async (req,res) => {
    try{
        const user = await userModel.findById(req.user._id).populate({path:'cart.productId',model : 'Products'});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            cart: user.cart,
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const UpdateUserCart = async (req,res) => {
    try{
        const { cart } = req.body;
        await userModel.findByIdAndUpdate(req.user._id, { cart }, { new: true });
        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
        });
    }
    catch(err){
        console.error("Cart update error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getMyAddresses = async (req, res) => {
  try {
    // 1) grab only shippingInfo + order _id
    const orders = await orderSchemas
      .find({ user: req.user._id })
      .select('shippingInfo _id');

    // 2) dedupe by stringified shippingInfo
    const seen = new Set();
    const addresses = [];
    for (const ord of orders) {
      const info = ord.shippingInfo;
      const key = JSON.stringify(info);
      if (!seen.has(key)) {
        seen.add(key);
        // attach the order _id so the front-end can key/index it
        addresses.push({ ...info, _id: ord._id });
      }
    }

    return res.status(200).json({ success: true, addresses });
  } catch (err) {
    console.error("getMyAddresses error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load addresses"
    });
  }
};