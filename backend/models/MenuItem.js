import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },

    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,

    available: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);