import { gameStore } from '../models/gameStore.js';

export const getUserProfile = async (req, res) => {
  try {
    const profile = await gameStore.getProfile();
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
