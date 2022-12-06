import { Router } from "express";
import * as Controller from "../controllers/verify.js"

const router = Router()

router.post('/send', Controller.sendVfCode)

router.post('/check', Controller.checkVfCode)

export default router;
