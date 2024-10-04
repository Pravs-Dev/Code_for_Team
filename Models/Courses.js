import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define the Module schema
const ModuleSchema = new Schema({
  module_name: {
    type: String,
    required: true,
  },
});

// Define the Year schema, with an array of modules
const YearSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  modules: [ModuleSchema], // Embedding Module schema as an array of modules
});

// Define the Course schema, with years of study
const CourseSchema = new Schema({
  course_name: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true, // e.g., "Biological Sciences", "Commerce", etc.
  },
  years_of_study: [YearSchema], // Embedding Year schema with an array of years
});

// Define the Faculty schema, with an array of courses
const FacultySchema = new Schema({
  faculty_name: {
    type: String,
    required: true,
  },
  courses: [CourseSchema], // Embedding Course schema as an array of courses
});

// Create the Faculty model from the schema
const Faculty = mongoose.model('Faculty', FacultySchema);

export default Faculty;
