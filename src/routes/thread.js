import { Router } from "express";
const router = Router()

import { getAllThreads, getThreadByID} from "../controllers/thread.js"

router.get('/', getAllThreads)

router.get('/:tid/page/:pg', getThreadByID)