import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
    const order = await Order.create({
        ...req.body,
        user: req.user._id
    });

    res.json(order);
};

export const getMyOrders = async (req, res) => {

    const orders = await Order.find({
        user: req.user._id
    }).populate("items.menuItem");

    res.json(orders);
};