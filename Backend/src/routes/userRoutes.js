import express from 'express';
import { getUserProfile, syncUserProfile } from '../controllers/userController.js';
import { actionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/profile', getUserProfile);
router.post('/sync', actionLimiter, syncUserProfile);

export default router;
