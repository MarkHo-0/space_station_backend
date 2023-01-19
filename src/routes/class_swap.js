import { Router } from "express";
import * as Controller from "..controllers/class_Swap.js"
import { authUser } from "../middlewares/authUser";

const router = Router()

router.get('/', authUser, Controller.CLSwapWrongInput);

