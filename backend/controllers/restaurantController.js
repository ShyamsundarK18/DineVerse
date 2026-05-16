import Restaurant from "../models/Restaurant.js";

/* CREATE RESTAURANT */
export const createRestaurant = async (req, res) => {

    const { name, lng, lat } = req.body;

    const restaurant = await Restaurant.create({
        name,
        owner: req.user._id,
        location: {
            type: "Point",
            coordinates: [lng, lat]
        }
    });

    res.json(restaurant);
};


/* GET NEARBY RESTAURANTS */
export const getNearby = async (req, res) => {

    const { lng, lat } = req.query;

    const restaurants = await Restaurant.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: 5000
            }
        }
    });

    res.json(restaurants);
};