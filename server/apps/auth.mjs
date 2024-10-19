import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authRouter = Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Admin06"
 *               password:
 *                 type: string
 *                 example: "password_6"
 *               fullname:
 *                 type: string
 *                 example: "Martin Smith"
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User has been created successfully"
 *       400:
 *         description: Username already taken or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username is already taken"  
 * /auth/login:
 *   post:
 *     summary: Log in a user and return a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Admin06"
 *               password:
 *                 type: string
 *                 example: "password_6"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mynJG4h... (JWT token)"
 *       400:
 *         description: Invalid credentials or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid username or password"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token is invalid or expired" 
 * /auth/logout:
 *   post:
 *     summary: Logout the user and invalidate the token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */
authRouter.post("/register", async (req, res) => {
    let results;
    try {
    
    const { username, password, full_name } = req.body;

    if (!username || !password || !full_name) {
        return res.status(400).json({
            message: "Please fill all required fields",
        })
    }
    
    const userExists = await connectionPool.query(
        `select * from users where username = $1`, [username]
    );

    if (userExists.rows[0]) {
        return res.status(400).json({
            message: "Username is already taken",
        })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);      
    
    const newUser = {
        username,
        password: hashedPassword,
        full_name,
        created_at: new Date(),
        updated_at: new Date(),
        last_logged_in: new Date(),
    };

    results = await connectionPool.query(
        `insert into users (username, password, full_name, created_at, updated_at, last_logged_in)
        values ($1, $2, $3, $4, $5, $6)`,
        [
            newUser.username,
            newUser.password,
            newUser.full_name,
            newUser.created_at,
            newUser.updated_at,
            newUser.last_logged_in,
        ]
    );
                  
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        })
    }
                          
    return res.json({
        message: "User has been created successfully",
    })
});

authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const userExists = await connectionPool.query(
        `select * from users where username = $1`, [username]
    );

    if (!userExists.rows[0]) {
        return res.status(400).json({
            message: "Username is not found",
        })
    }
    const user = userExists.rows[0];
    const isValidPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!isValidPassword) {
        return res.status(400).json({
            message: "Password is not valid",
        })
    }

    const token = jwt.sign(
        { 
             id: user.user_id, 
             fullname: user.full_name, 
        },
        process.env.SECRET_KEY,
        {
             expiresIn: "1h",
        }
   );

    return res.json({
        message: "Login successfully",
        token,
    });
})

authRouter.post("/logout", async (req, res) => {
    return res.json({
        message: "Logged out successfully",
    })
})

export default authRouter;