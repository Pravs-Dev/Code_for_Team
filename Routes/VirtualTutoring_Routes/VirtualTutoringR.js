import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  modifySession,
  deleteSessionById,
  getSessionsByStudentId
} from '../../Controllers/VirtualTutoring_Controller/VirtualTutoringC.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sessions = await getAllSessions();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const session = await getSessionById(id);
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const newSession = req.body;
  try {
    const session = await createSession(newSession);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const session = await modifySession(id, payload);
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteSessionById(id);
    if (result) {
      res.status(200).json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const sessions = await getSessionsByStudentId(studentId);
    if (sessions.length > 0) {
      res.status(200).json(sessions);
    } else {
      res.status(404).json({ message: 'No sessions found for this student' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
});

export default router;
