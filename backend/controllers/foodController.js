import foodModel from "../models/foodModel.js";
import fs from "fs";

//add food item

const addFood = async (req, res) => { 

    let image_filename = `${req.file.filename}`;
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try {
        const savedFood = await food.save();
        console.log("Saved food:", savedFood);
        res.json({ success: true, message: "Food item added successfully" });
    } catch (error) {
        console.error("Error saving food:", error);
        res.json({ success: false, message: "Failed to add food item" });
    }
}

//all food items
const listFood = async (req, res) => {
    try {
        const foodItems = await foodModel.find();
        res.json({ success: true, data: foodItems }); // changed 'foods' to 'data'
    } catch (error) {
        console.error("Error fetching food items:", error);
        res.json({ success: false, message: "Failed to fetch food items" });
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food Removed"})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to remove food item" });
    }
}

export { addFood,listFood,removeFood};
