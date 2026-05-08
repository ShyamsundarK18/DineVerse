import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: String,
    cuisine: String,
    rating: { type: Number, default: 0 },
    image: String,

    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: [Number]
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

restaurantSchema.index({ location: "2dsphere" });

export default mongoose.model("Restaurant", restaurantSchema);