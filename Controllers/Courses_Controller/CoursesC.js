import Faculty from "../../Models/Courses.js"; // Import the Faculty model from Courses.js

// Create a new faculty
export const createFaculty = async (payload) => {
  try {
    const newFaculty = new Faculty(payload);
    const savedFaculty = await newFaculty.save();
    return savedFaculty;
  } catch (error) {
    throw new Error(`Error creating faculty: ${error.message}`);
  }
};

// Get all faculties
export const getAllFaculties = async () => {
  try {
    const faculties = await Faculty.find(); // This will retrieve all faculties with embedded data
    return faculties;
  } catch (error) {
    throw new Error(`Error fetching faculties: ${error.message}`);
  }
};

// Get a faculty by ID
export const getFacultyById = async (id) => {
  try {
    // Directly find the faculty, no need for populate as the data is embedded
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    return faculty;
  } catch (error) {
    throw new Error(`Error fetching faculty: ${error.message}`);
  }
};

// Add a course to a faculty
export const addCourseToFaculty = async (facultyId, coursePayload) => {
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    faculty.courses.push(coursePayload); // Add new course to the array of courses
    await faculty.save();
    return faculty;
  } catch (error) {
    throw new Error(`Error adding course to faculty: ${error.message}`);
  }
};

// Add a year to a course within a faculty
export const addYearToCourse = async (facultyId, courseId, yearPayload) => {
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    const course = faculty.courses.id(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    course.years_of_study.push(yearPayload); // Add new year to the selected course
    await faculty.save();
    return faculty;
  } catch (error) {
    throw new Error(`Error adding year to course: ${error.message}`);
  }
};

// Add a module to a year within a course
export const addModuleToYear = async (facultyId, courseId, yearId, modulePayload) => {
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    const course = faculty.courses.id(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    const year = course.years_of_study.id(yearId);
    if (!year) {
      throw new Error('Year not found');
    }
    year.modules.push(modulePayload); // Add new module to the selected year
    await faculty.save();
    return faculty;
  } catch (error) {
    throw new Error(`Error adding module to year: ${error.message}`);
  }
};

// Delete a faculty by ID
export const deleteFacultyById = async (id) => {
  try {
    const result = await Faculty.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Faculty not found');
    }
    return result;
  } catch (error) {
    throw new Error(`Error deleting faculty: ${error.message}`);
  }
};
