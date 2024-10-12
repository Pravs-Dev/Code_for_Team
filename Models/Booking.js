import mongoose from 'mongoose';


const BookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Student is required"],
  },


  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Tutor is required"],
  },


  subject: {
    type: String,
    required: [true, "Please specify the subject"],
  },

  sessionDate: {
    type: Date,
    required: [true, "Session date is required"],
  },

  sessionTime: {
    type: String, 
    required: [true, "Session time is required"],
  },
  duration: {
    type: Number, 
    required: [true, "Please specify the duration of the session"],
  },
  meetingType: {
    type: String, 
    enum: ['In-person', 'Online', 'Individual'],
    default: 'In-person',
  },
  
  status: {
    type: String,
    enum: ['Scheduled','Confirmed', 'Cancelled', 'Completed', 'Reviewed'],
    default: 'Scheduled',
  },
  cancellationReason: {
    type: String,
    required: function () { return this.status === 'Cancelled'; },
  },

  locationMessage: {
    type: String,
    required: function () { return this.status === 'Confirmed'; },
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },

  
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
  }],
}, { timestamps: true });


const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
