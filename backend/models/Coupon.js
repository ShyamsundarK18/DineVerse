import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discount_type: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    discount_value: {
        type: Number,
        required: true
    },
    min_order: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);