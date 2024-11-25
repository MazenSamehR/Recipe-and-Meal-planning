const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    // the request from the frontend should provide the token in the header and the token should be in the format of "Bearer token"
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(403).json({
            status: "FAILED",
            message: "Access denied. No token provided.",
        });
    }

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({message: "Invalid or expired token."})
    }
};

module.exports = verifyToken;