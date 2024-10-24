import bcrypt from 'bcrypt';
import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Ensure password meets the following criteria:
        // - At least 8 characters long
        // - Contains at least one lowercase letter
        // - Contains at least one uppercase letter
        // - Contains at least one number
        // - Contains at least one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(value);
      },
      message:
        'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    },
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  profilePicture: {
  data: {
    type: Buffer, 
  },
  contentType: {
    type: String, 
  },
  originalName: {
    type: String, 
  },
},
courses: {
  type: [String],
  default: [] 
},
subjects: {
  type: [String],
  default: [] 
},
qualifications: {
  type: [String],
  default: [] 
},
  status: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true }); 

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew) {
    if (this.role === 'student') {
        this.subjects = undefined;
        this.qualifications = undefined;
    } else if (this.role === 'tutor') {
        this.courses = undefined;
    }
}
  next();
});


const User = mongoose.model('User', userSchema);
export default User;
