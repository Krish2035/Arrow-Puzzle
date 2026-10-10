import { gameStore } from '../models/gameStore.js';
import { searchLevelsQuery } from '../services/searchService.js';

export const getLevels = async (req, res) => {
  try {
    const levels = await gameStore.getAllLevels();
    res.json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchLevels = async (req, res) => {
  try {
    const { q, difficulty, minArrows, maxArrows, limit, offset } = req.query;
    const results = await searchLevelsQuery({
      q: q || '',
      difficulty: difficulty || '',
      minArrows: minArrows ? Number(minArrows) : 0,
      maxArrows: maxArrows ? Number(maxArrows) : 999,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const { levelNumber } = req.params;
    const level = await gameStore.getLevel(levelNumber);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }
    res.json({ success: true, data: level });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeLevel = async (req, res) => {
  try {
    const { levelNumber } = req.params;
    const { heartsLeft, timeSeconds } = req.body;
    const result = await gameStore.completeLevel(levelNumber, heartsLeft, timeSeconds);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDailyChallenge = async (req, res) => {
  try {
    const challenge = await gameStore.getDailyChallenge();
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
