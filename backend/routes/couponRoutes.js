import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// 1. GET ALL COUPONS (Admin dashboards ya checkout ke liye)
router.get('/', protect, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. CREATE NEW COUPON (Sirf Admin kar sake)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order, is_active } = req.body;

    // Check agar coupon code pehle se exists karta hai
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists!" });
    }

    const coupon = await Coupon.create({
      code,
      discount_type,
      discount_value,
      min_order,
      is_active
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. DELETE A COUPON
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;