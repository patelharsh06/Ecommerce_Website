// middleware/isAuthenticated.js
import userModelSchemas from "../models/userModelSchemas.js";
import { jwtDecoder } from "./jwtEncodeDecode.js";

const authMiddleware = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({message: "Unauthorized, token missing or invalid"});
        }
        
        const payload = jwtDecoder(token);

        if (!payload) {
            return res.status(401).json({ message: "Unauthorized, token is expired or invalid" });
        }

        if (payload.role === 'admin') {
            req.user = {
                _id: payload.id,
                role: 'admin'
            };
            return next();
        }
        
        const user = await userModelSchemas.findById(payload.id).select("+role");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid token, user not found" });
        }
        
        req.user = user; 
        next();
    }
    catch(err) {
        console.error("Auth error:", err);
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }
}

export default authMiddleware;