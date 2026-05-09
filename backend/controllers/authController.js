import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

/* REGISTER */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


/* LOGIN */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User
            .findOne({ email })
            .select("+password");

        if (!user)
            return res.status(400).json({ msg: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ msg: "Invalid credentials" });

        const token = generateToken(user._id, user.role);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


/* GET PROFILE */
export const getProfile = async (req, res) => {
    res.json(req.user);
};


/* UPDATE PROFILE */
export const updateProfile = async (req, res) => {

    const user = await User.findById(req.user._id);

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.json(user);
};