import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true,
            select: false //  hide password automatically
        },

        role: {
            type: String,
            enum: ["USER", "RESTAURANT", "COURIER"],
            default: "USER"
        },

        loyaltyPoints: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);