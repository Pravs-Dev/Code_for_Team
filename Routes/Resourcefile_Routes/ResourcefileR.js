import express from 'express';
import {
  createResourcefile,
  getAllResourcesfile,
  getResourcefileById,
  modifyResourcefile,
  deleteResourcefileById,
  shareResourceWithStudentByName,
  getResourcesSharedWithStudent, 
} from '../../Controllers/Resourcefile_Controller/ResourcefileC.js';
import { uploadFile } from '../../multerconfig.js';
import Resourcefile from '../../Models/Resourcefile.js'; 

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const resourcesfile = await getAllResourcesfile();
    res.status(200).json(resourcesfile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resourcefile = await Resourcefile.findById(id);

    if (!resourcefile) {
      return res.status(404).json({ message: 'File not found' });
    }

    
    res.set({
      'Content-Type': resourcefile.file.contentType,
      'Content-Disposition': `attachment; filename="${resourcefile.file.originalName}"`,
    });

    
    res.send(resourcefile.file.data);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

router.post('/', uploadFile, async (req, res) => {
  try {
    const { file } = req;
    const { uploadedBy, tags } = req.body;

    const resourcefile = await createResourcefile(file, uploadedBy, tags);
    res.status(201).json(resourcefile); 
  } catch (error) {
    console.error('Error creating resourcefile:', error);
    res.status(500).json({ message: 'Error creating resourcefile', error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const resourcefile = await modifyResourcefile(id, payload);
    if (resourcefile) {
      res.status(200).json(resourcefile);
    } else {
      res.status(404).json({ message: 'Resourcefile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating resourcefile', error: error.message });
  }
});

// Share a resource with a specific student by name
router.post('/:id/share', async (req, res) => {
  const { id } = req.params;
  try {
    const { studentName, tutorId } = req.body;
    const userId = req.user?.id || tutorId; // Use tutorId from the request body if req.user is unavailable
    const result = await shareResourceWithStudentByName(id, studentName, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing resource', error: error.message });
  }
});

// Get resources shared with a specific student
router.get('/shared-with/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const resourcesfile = await getResourcesSharedWithStudent(studentId);
    res.status(200).json(resourcesfile); // Return the resources directly
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shared resources', error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteResourcefileById(id);
    if (result) {
      res.status(200).json({ message: 'Resourcefile deleted successfully' });
    } else {
      res.status(404).json({ message: 'Resourcefile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resourcefile', error: error.message });
  }
});

export default router;
