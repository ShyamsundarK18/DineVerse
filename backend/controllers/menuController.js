import MenuItem from "../models/MenuItem.js";

export const createMenuItem = async (req, res) => {

    const item = await MenuItem.create(req.body);
    res.json(item);
};

export const getMenu = async (req, res) => {

    const items = await MenuItem.find({
        restaurant: req.params.restaurantId
    });

    res.json(items);
};