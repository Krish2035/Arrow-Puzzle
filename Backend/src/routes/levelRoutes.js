import express from 'express';
import {
  getLevels,
  getLevelById,
  completeLevel,
  getDailyChallenge,
  searchLevels
} from '../controllers/levelController.js';
import { actionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/', getLevels);
router.get('/search', searchLevels);
router.get('/daily/today', getDailyChallenge);
router.get('/:levelNumber', getLevelById);
router.post('/:levelNumber/complete', actionLimiter, completeLevel);

export default router;
