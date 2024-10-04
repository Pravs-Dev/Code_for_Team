import express from 'express';
import {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  addCourseToFaculty,
  addYearToCourse,
  addModuleToYear,
  deleteFacultyById,
} from '../../Controllers/Courses_Controller/CoursesC.js';

const router = express.Router();

// Get all faculties
router.get('/', async (req, res) => {
  try {
    const faculties = await getAllFaculties();
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculties', error: error.message });
  }
});

// Get a faculty by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await getFacultyById(id);
    if (faculty) {
      res.status(200).json(faculty);
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty', error: error.message });
  }
});

// Create a new faculty
router.post('/', async (req, res) => {
  const newFaculty = req.body;
  try {
    const faculty = await createFaculty(newFaculty);
    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty', error: error.message });
  }
});

// Add a course to a faculty
router.post('/:facultyId/add-course', async (req, res) => {
  const { facultyId } = req.params;
  const coursePayload = req.body;
  try {
    const faculty = await addCourseToFaculty(facultyId, coursePayload);
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error adding course to faculty', error: error.message });
  }
});

// Add a year to a course within a faculty
router.post('/:facultyId/:courseId/add-year', async (req, res) => {
  const { facultyId, courseId } = req.params;
  const yearPayload = req.body;
  try {
    const faculty = await addYearToCourse(facultyId, courseId, yearPayload);
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error adding year to course', error: error.message });
  }
});

// Add a module to a year within a course
router.post('/:facultyId/:courseId/:yearId/add-module', async (req, res) => {
  const { facultyId, courseId, yearId } = req.params;
  const modulePayload = req.body;
  try {
    const faculty = await addModuleToYear(facultyId, courseId, yearId, modulePayload);
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error adding module to year', error: error.message });
  }
});

// Delete a faculty by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteFacultyById(id);
    if (result) {
      res.status(200).json({ message: 'Faculty deleted successfully' });
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty', error: error.message });
  }
});

export default router;
