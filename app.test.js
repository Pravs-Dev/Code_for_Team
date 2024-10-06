import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './Authentication/RouteA.js'; 
import userRoutes from './Routes/User_Routes/UserR.js'; 
import resourceRoutes from './Routes/Resource_Routes/ResourceR.js';
import resourcefileRoutes from './Routes/Resourcefile_Routes/ResourcefileR.js';
import Resourcefile from './Models/Resourcefile.js';
import bookingRoutes from './Routes/Booking_Routes/BookingR.js';
import notificationRoutes from './Routes/Notification_Routes/NotificationR.js';
import virtualtutoringRoutes from './Routes/VirtualTutoring_Routes/VirtualTutoringR.js';
import './Authentication/passport.js';
import { authenticateToken } from './tokenmiddleware.js';
import { fileURLToPath } from 'url';
import request from 'supertest';

// Setup the app
const app = express();

const mongoURI = 'mongodb+srv://pravirstudy:l9bCqH0MJzLQOtFl@backenddb.li8va.mongodb.net/?retryWrites=true&w=majority&appName=BackEndDB';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 50000 
})

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/virtualtutoring', virtualtutoringRoutes);
app.use('/api/resourcesfile', resourcefileRoutes);

const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.get('/test', (req, res) => {
  res.send('test');
});

let userId; // Global variable to store the user ID
let TutorId;

function generateRandomPassword() {
  // Character sets
  let length = 12;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialCharacters = '@$!%*?&';

  // Ensure the password has at least one character from each set
  const passwordArray = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
  ];

  // Fill the rest of the password length with a mix of all characters
  const allCharacters = lowercase + uppercase + numbers + specialCharacters;
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
  }

  // Shuffle the password array to prevent predictable patterns
  const shuffledPassword = passwordArray.sort(() => Math.random() - 0.5).join('');
  return shuffledPassword;
}




describe('User Unit Tests', () => {

  const randomEmail = () => `test${Math.floor(Math.random() * 100000)}@example.com`;
  const randomName = () => `User${Math.floor(Math.random() * 1000)}`;

  const TrandomEmail = () => `test${Math.floor(Math.random() * 100000)}@example.com`;
  const TrandomName = () => `User${Math.floor(Math.random() * 1000)}`;

  it('should return "test"', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('test');
  });

  it('should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000); // Set the timeout to 10 seconds (10000 ms)

  it('should create a new user', async () => {
    const newUser = {
      email: randomEmail(), // Generate a random email
      password: generateRandomPassword(),
      fname: randomName(), // Generate a random first name
      lname: 'Doe',
      role: 'student'
    };
    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('_id');

    // Store the user ID globally
    userId = res.body.user._id;
  });

  it('should create a new Tutor', async () => {
    const newUser = {
      email: TrandomEmail(), // Generate a random email
      password: generateRandomPassword(),
      fname: TrandomName(), // Generate a random first name
      lname: 'Doeer',
      role: 'tutor'
    };
    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('_id');

    // Store the user ID globally
    TutorId = res.body.user._id;
  });

  it('should return a specific user by ID', async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', userId);
  });

  it('should return the profile picture for a specific user by userId', async () => {
    let userId = "66f93e6c5de69a52e153877c";
    const res = await request(app).get(`/api/users/${userId}/profile-picture`);
    expect(res.statusCode).toEqual(200); 
  });



  it('should update the user profile picture', async () => {
    const updatedData = {
      password: 'Password123!'
    };

    // Create a form-data object to send along with the file
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .field('password', updatedData.password) 
      .attach('profilePicture', Buffer.from('new image data'), { filename: 'new-profile.png' }); // Use attach for file upload

    expect(res.statusCode).toEqual(200); // Expect success status
  });

  it('should return 404 for non-existent user', async () => {
    const nonExistentUserId = '66e8a4235629979b7e8f6235';
    const res = await request(app).get(`/api/users/${nonExistentUserId}`);
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toBe("Error fetching user");
  });

  it('should login a user with invalid details', async () => {
    const loginDetails = {
      email: 'invaliduser@example.com', // Using invalid email
      password: 'Password123!'//passes check 
    };
    const res = await request(app).post('/api/users/login').send(loginDetails);
    expect(res.statusCode).toEqual(401); // Expecting unauthorized
  });

  it('should update the user', async () => {
    const updatedUser = { password: 'Password123!' };
    const res = await request(app).put(`/api/users/${userId}`).send(updatedUser);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete the user', async () => {
    const res = await request(app).delete(`/api/users/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('User deleted successfully');
  });


  it('should delete the tutor', async () => {
    const res = await request(app).delete(`/api/users/${TutorId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});

describe('Bookings Unit Test', () => {
  let bookingId; // Variable to store the bookingId

  // Create a new booking before all tests
  beforeAll(async () => {
    const newBooking = {
      student: '64e5e2c6c5e6f1a0d0d1e4b0', 
      tutor: '64e5e2c6c5e6f1a0d0d1e4b1', 
      subject: 'Advanced Algebra',
      sessionDate: '2024-10-01T00:00:00.000Z',
      sessionTime: '10:00 AM',
      duration: 60,
    };

    const res = await request(app).post('/api/bookings').send(newBooking);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');

    // Store the bookingId for use in the following tests
    bookingId = res.body._id;
  });

  it('should create a new booking', async () => {
    const newBooking = {
      student: '64e5e2c6c5e6f1a0d0d1e4b0', 
      tutor: '64e5e2c6c5e6f1a0d0d1e4b1', 
      subject: 'Advanced Algebra',
      sessionDate: '2024-10-01T00:00:00.000Z',
      sessionTime: '10:00 AM',
      duration: 60,
    };

    const res = await request(app).post('/api/bookings').send(newBooking);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.subject).toBe(newBooking.subject);
    expect(new Date(res.body.sessionDate).toISOString()).toBe(newBooking.sessionDate);
    expect(res.body.sessionTime).toBe(newBooking.sessionTime);
    expect(res.body.duration).toBe(newBooking.duration);
  });

  it('should get all bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a booking by ID', async () => {
    const res = await request(app).get(`/api/bookings/${bookingId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', bookingId);
  });

  it('should update the booking to completed', async () => {
    const updatedBooking = { 
      status: 'Completed', 
      cancellationReason: 'No longer needed' 
    };

    const res = await request(app).put(`/api/bookings/${bookingId}`).send(updatedBooking);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe(updatedBooking.status);
    expect(res.body.cancellationReason).toBe(updatedBooking.cancellationReason);
  });

  it('should cancel a booking successfully', async () => {
    const reason = 'Change of plans'; // Example cancellation reason

    const res = await request(app)
      .put(`/api/bookings/cancel/${bookingId}`)
      .send({ reason }); 

    expect(res.statusCode).toEqual(200); 
    expect(res.body).toHaveProperty('status', 'Cancelled'); 
    expect(res.body).toHaveProperty('cancellationReason', reason); 
  });



  it('should delete the booking', async () => {
    const res = await request(app).delete(`/api/bookings/${bookingId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Booking deleted successfully');
  });

  it('should check for a specific tutor by ID if they have one', async () => {
    const tutorId = '6700f0e49e512370d343f340'; 
    const res = await request(app).get(`/api/tutor/${tutorId}`);
  
    expect(res.statusCode).toEqual(404); 
  });
  // it('should return completed sessions for a specific student by ID', async () => {
  //   const studentId = '60c72b2f9b1d8f4d2e3f8d6e'; // Replace with a valid student ID or mock it as needed
  //   const res = await request(app).get(`/api/student/${studentId}/completed`);
  
  //   expect(res.statusCode).toEqual(200); // Expect successful response
  //   expect(Array.isArray(res.body)).toBe(true); // Ensure the response is an array of sessions
  //   expect(res.body.length).toBeGreaterThan(0); // Ensure that there are completed sessions returned
  // });
  
  // it('should mark a session as reviewed', async () => {
  //   const sessionId = '66e8cde3a9acf9ca9afcc5a1'; // Replace with a valid session ID or mock it as needed
  //   const res = await request(app).put(`/api/${sessionId}/reviewed`);
  
  //   expect(res.statusCode).toEqual(200); // Expect successful response
  //   expect(res.body).toHaveProperty('status', 'Reviewed'); // Check if the session status is updated
  // });
  

});

describe('Virtual Tutoring Unit Tests', () => {
  let sessionId; // Store the sessionId here

  it('should create a new session', async () => {
    const tutorId = "66fb28865293c80710d63a82";
    const studentId = "66e8a4235629979b7e8f6236";

    const newSession = {
      tutorId: tutorId.toString(),
      studentId: studentId.toString(),
      scheduledTime: '2024-10-01T10:00:00.000Z', 
      scheduledDate: '2024-10-01',  
      videoConferenceUrl: 'https://example.com/conference/' + Math.floor(10000 + Math.random() * 90000),
      status: 'scheduled',
      notes: 'A session on advanced algebra'
    };

    // Call the API
    const res = await request(app).post('/api/virtualtutoring').send(newSession);

    // Check for correct status code
    expect(res.statusCode).toEqual(201);

    // Ensure the response has _id
    expect(res.body).toHaveProperty('_id');
    sessionId = res.body._id; // Save the session ID

    // Check if the response matches the sent object
    expect(res.body).toMatchObject({
      tutorId: newSession.tutorId,
      studentId: newSession.studentId,
      scheduledTime: newSession.scheduledTime,
      scheduledDate: newSession.scheduledDate,
      videoConferenceUrl: newSession.videoConferenceUrl,
      notes: newSession.notes
    });
  });

  it('should return all sessions', async () => {
    const res = await request(app).get('/api/virtualtutoring');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return a specific session by ID', async () => {
    const res = await request(app).get(`/api/virtualtutoring/${sessionId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', sessionId);
  });

  it('should return 404 for non-existent session', async () => {
    const nonExistentSessionId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/virtualtutoring/${nonExistentSessionId}`);
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toBe('Error fetching session');
  });

  it('should update the session', async () => {
    const updatedSession = { notes: 'Updated Math Tutoring' };

    const res = await request(app)
      .put(`/api/virtualtutoring/${sessionId}`)
      .send(updatedSession);

    expect(res.statusCode).toEqual(200);
    expect(res.body.notes).toBe('Updated Math Tutoring');
  });

  it('should delete the session', async () => {
    const res = await request(app).delete(`/api/virtualtutoring/${sessionId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Session deleted successfully');
  });

  it('should return sessions for a specific student by studentId and student doesnt have a session', async () => {
    const studentId = '66e8a4235629979b7e8f6236'; 
    
    const res = await request(app).get(`/api/virtualtutoring/student/${studentId}`);
  
    expect(res.statusCode).toEqual(404); 
  
  });


  it('should return sessions for a specific student by studentId and student does have a session', async () => {
    const studentId = '60c72b2f9b1d8f4d2e3f8d6e'; 
    
    const res = await request(app).get(`/api/virtualtutoring/student/${studentId}`);
  
    expect(res.statusCode).toEqual(200); 
    expect(res.body).toBeInstanceOf(Array);  
    expect(res.body.length).toBeGreaterThan(0);  

  });

});

let resourceId = "66f6c792e561ff78803d42e3";

describe('Resourcefile Unit Tests', () => {



  beforeAll(async () => {

    const resourcefile = new Resourcefile({
      file: {
        data: Buffer.from('test data'),
        contentType: 'application/pdf',
        originalName: 'testfile.pdf'
      },
      uploadedBy: new mongoose.Types.ObjectId(), // Create a mock ObjectId for testing
      tags: ['test', 'example']
    });
    const savedResourcefile = await resourcefile.save();
    resourceId = savedResourcefile._id.toString(); // Store resource ID for later tests
  });


  it('should return all resource files', async () => {
    const res = await request(app).get('/api/resourcesfile');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });



  // it('should create a new resource file', async () => {
  //   const newResourcefile = {
  //     uploadedBy: userId, // Use the mock user ID
  //     tags: 'newTag1,newTag2' // Tags as a comma-separated string
  //   };

  //   // Create a buffer to simulate file data
  //   const fileBuffer = Buffer.from('new test data');

  //   const res = await request(app)
  //     .post('/api/resourcesfile') // Adjust the endpoint according to your routes
  //     .field('uploadedBy', newResourcefile.uploadedBy) // Use .field() for uploadedBy
  //     .field('tags', newResourcefile.tags) // Use .field() for tags
  //     .attach('file', fileBuffer, { filename: 'newfile.pdf', contentType: 'application/pdf' }); // Use .attach() for file upload

  //   expect(res.statusCode).toEqual(201); // Expect a successful creation
  // });


  it('should return a specific resource file by ID', async () => {
    const res = await request(app).get(`/api/resourcesfile/${resourceId}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should update a resource file', async () => {
    const updatedData = {
      tags: ['updatedTag'] // Update tags
    };

    const res = await request(app)
      .put(`/api/resourcesfile/${resourceId}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
  });

  it('should return 404 for non-existent resource file', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/resourcesfile/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'File not found');
  });

  it('should delete a resource file', async () => {
    const res = await request(app).delete(`/api/resourcesfile/${resourceId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Resourcefile deleted successfully');
  });
});


describe('Notifications Unit Test', () => {
  let notificationId;
  const userId = '66d3c6bea7133bbc3a897ec1'; // Sample user ID

  beforeAll(async () => {
    const newNotification = {
      message: 'New Message',
      user: userId,
    };

    const res = await request(app).post('/api/notifications').send(newNotification);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    notificationId = res.body._id; // Store notificationId for use in other tests
  });

  it('should create a new notification', async () => {
    const newNotification = {
      message: 'Appointment Reminder',
      user: userId,
    };

    const res = await request(app).post('/api/notifications').send(newNotification);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.message).toBe(newNotification.message);
    expect(res.body.user).toBe(newNotification.user);
    expect(res.body.read).toBe(false); // Ensure the default read value is false
  });

  it('should get all notifications for a user', async () => {
    const res = await request(app).get('/api/notifications?user=66d3c6bea7133bbc3a897ec1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a notification by ID', async () => {
    const res = await request(app).get(`/api/notifications/${notificationId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', notificationId);
  });
  it('should return an error if message is missing', async () => {
    const newNotification = {
      user: userId,
    };

    const res = await request(app).post('/api/notifications').send(newNotification);
    expect(res.statusCode).toEqual(500); // Assuming you handle validation errors
    expect(res.body.message).toBe('Error creating notification');
  });
  it('should mark a notification as read', async () => {
    const res = await request(app).put(`/api/notifications/read/${notificationId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', notificationId);
    expect(res.body.read).toBe(true); // Assuming markNotificationAsRead updates the read status to true
  });

  it('should return 500 if notification not found when marking as read', async () => {
    const res = await request(app).put('/api/notifications/read/invalidId'); // Use an invalid ID
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toBe('Error updating notification');
  });

  it('should delete a notification', async () => {
    const res = await request(app).delete(`/api/notifications/${notificationId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Notification deleted successfully');
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });
});