import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided or invalid format",
        });
    };

    const tokenWithoutBearer = token.split(" ")[1];

    try {
        const payload = jwt.verify(tokenWithoutBearer, process.env.SECRET_KEY);
        req.user = payload;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Token is invalid or expired",
        });
    };
};