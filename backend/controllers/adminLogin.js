import userModel from '../models/userModelSchemas.js';
import productSchemas from '../models/productSchemas.js';
import orderSchemas from '../models/orderSchemas.js';
import dayjs from 'dayjs';

export const adminLogout = async (req,res) => {
    try{
        // Clear the token cookie to log out the user
        res.cookie("token",null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        // Return success message
        res.status(200).json({
            success: true,
            message: "Admin logout successful",
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



export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers    = await userModel.countDocuments();
    const totalProducts = await productSchemas.countDocuments();

    // count orders created since midnight today
    const startOfDay = dayjs().startOf('day').toDate();
    const salesToday = await orderSchemas.countDocuments({ createdAt: { $gte: startOfDay } });

    return res.json({
      success: true,
      stats: { totalUsers, totalProducts, salesToday }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success:false, message:'Server Error' });
  }
};
