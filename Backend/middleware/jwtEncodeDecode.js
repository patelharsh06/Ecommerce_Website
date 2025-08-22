// importing jwt library for token generation and verification
import jwt from 'jsonwebtoken';

// importing environment variables
const {jwtSecret} = process.env;

//function for signing the jwt token with HS512 algorithm
export const jwtGenerator = function jwtGenerator(payload) {
    try{
        return jwt.sign(payload,process.env.jwtSecret,{algorithm: 'HS512', expiresIn: '1h'})
    }
    catch(err){
        console.error('JWT encoding error:', err);
        return null;
    }
}

//function for decoding the jwt token with HS512 algorithm
export const jwtDecoder = function jwtDecoder(token){
    try{
        return jwt.verify(token,process.env.jwtSecret,{algorithms: ['HS512']});
    }
    catch(err){
        console.error('JWT decoding error:', err);
        return null;
    }
}