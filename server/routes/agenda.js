import express from 'express';
import Agenda from '../models/Agenda.js';

const router = express.Router();

// @route   GET /api/agenda
// @desc    Get all agenda items, optionally filter by theme
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { theme } = req.query;
    let query = {};
    if (theme) {
      query.theme = theme;
    }
    const agendaItems = await Agenda.find(query).populate('speakerId');
    res.json(agendaItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
