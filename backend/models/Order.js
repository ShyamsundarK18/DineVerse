import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant"
        },

        items: [
            {
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MenuItem"
                },
                quantity: Number,
                price: Number
            }
        ],

        totalAmount: Number,

        status: {
            type: String,
            enum: [
                "PLACED",
                "ACCEPTED",
                "PREPARING",
                "IN_TRANSIT",
                "DELIVERED"
            ],
            default: "PLACED"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);