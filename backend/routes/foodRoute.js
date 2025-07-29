import express from "express";
import { addFood,listFood,removeFood } from "../controllers/foodController.js";
import multer from "multer";
import path from "path";

const foodRouter = express.Router();


//Image storage Engine
const storage = multer.diskStorage({
   destination:"uploads",
   filename:(req,file,cb)=>{
       const ext = path.extname(file.originalname);
       cb(null, `${Date.now()}${ext}`);
   }
})

const upload = multer({storage:storage});

foodRouter.post("/add",upload.single("image"),addFood);
foodRouter.get("/list",listFood);
foodRouter.delete('/remove', removeFood);



export default foodRouter;
