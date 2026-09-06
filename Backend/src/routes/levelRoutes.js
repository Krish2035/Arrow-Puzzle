import express from 'express';
import {
  getLevels,
  getLevelById,
  completeLevel,
  getDailyChallenge
} from '../controllers/levelController.js';

const router = express.Router();

router.get('/', getLevels);
router.get('/daily/today', getDailyChallenge);
router.get('/:levelNumber', getLevelById);
router.post('/:levelNumber/complete', completeLevel);

export default router;
