import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  modifyBooking,
  cancelBooking,
  deleteBookingById,
  getBookingByTutor, 
  getCompletedAndReviewedSessionsByStudent,
  markSessionAsReviewed,
  getCancelledSessionsByStudent,
} from '../../Controllers/Booking_Controller/BookingC.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.status(200).json(bookings); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await getBookingById(id);
    if (booking) {
      res.status(200).json(booking); 
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});


router.post('/', async (req, res) => {
  const newBooking = req.body;
  try {
    const booking = await createBooking(newBooking);
    res.status(201).json(booking); 
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const booking = await modifyBooking(id, payload);
    if (booking) {
      res.status(200).json(booking); 
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});


router.put('/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; 
  try {
    const booking = await cancelBooking(id, reason);
    if (booking) {
      res.status(200).json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error canceling booking', error: error.message });
  }
});

router.get('/student/:id/cancelled', async (req, res) => {
  const { id } = req.params;
  try {
      // Fetch cancelled sessions using the updated controller function
      const cancelledSessions = await getCancelledSessionsByStudent(id);
      res.status(200).json(cancelledSessions); 
  } catch (error) {
      res.status(500).json({ message: 'Error fetching cancelled sessions', error: error.message });
  }
});



router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteBookingById(id); 
    if (result) {
      res.status(200).json({ message: 'Booking deleted successfully' }); 
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

router.get('/tutor/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await getBookingByTutor(id);
    if (booking) {
      res.status(200).json(booking); 
    } else {
      res.status(404).json({ message: 'Bookings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

router.get('/student/:id/completed', async (req, res) => {
  const { id } = req.params;
  try {
      // Fetch completed and reviewed sessions using the updated controller function
      const completedSessions = await getCompletedAndReviewedSessionsByStudent(id);
      res.status(200).json(completedSessions); 
  } catch (error) {
      res.status(500).json({ message: 'Error fetching completed sessions', error: error.message });
  }
});

// Update booking to mark it as reviewed
router.put('/:id/reviewed', async (req, res) => {
  const { id } = req.params;
  try {
    const reviewedSession = await markSessionAsReviewed(id);
    if (reviewedSession) {
      res.status(200).json(reviewedSession); // Send back the updated session
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking session as reviewed', error: error.message });
  }
});




export default router;
