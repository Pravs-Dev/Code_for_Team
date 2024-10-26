import mongoose from 'mongoose';
import Resourcefile from '../../Models/Resourcefile.js'
import User from '../../Models/User.js';


export const createResourcefile = async (file, uploadedBy, tags) => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const newResourcefile = new Resourcefile({
    file: {
      data: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
    },
    uploadedBy: new mongoose.Types.ObjectId(uploadedBy),
    tags: tags ? tags.split(',') : [], 
  });

  
  return await newResourcefile.save();
};

export const getAllResourcesfile = async () => {
  try {
    const resourcesfile = await Resourcefile.find();
    return resourcesfile;
  } catch (error) {
   throw new Error(`Error fetching resourcesfile: ${error.message}`);
  }
};

export const getResourcefileById = async (id) => {
  try {
    const resourcefile = await Resourcefile.findById(id);
    if (!resourcefile) {
      throw new Error('Resourcefile not found');
    }
    return resourcefile;
  } catch (error) {
    throw new Error(`Error fetching resourcefile: ${error.message}`);
  }
};

export const modifyResourcefile = async (id, payload) => {
  try {
    const resourcefile = await Resourcefile.findById(id);
    if (!resourcefile) {
      throw new Error('Resourcefile not found');
    }

    Object.keys(payload).forEach((key) => {
      resourcefile[key] = payload[key];
    });

    const updatedResourcefile = await resourcefile.save();
    return updatedResourcefile;
  } catch (error) {
    throw new Error(`Error updating resourcefile: ${error.message}`);
  }
};


export const shareResourceWithStudentByName = async (id, studentName, tutorId) => {
  // Find the student by first and last name
  const student = await User.findOne({ fname: studentName.fname, lname: studentName.lname, role: 'student' });
  if (!student) throw new Error('Student not found with the provided names');

  // Update the resource directly
  const result = await Resourcefile.updateOne(
      { _id: id, uploadedBy: tutorId, sharedWith: { $ne: student._id } }, // Ensure the student is not already in the array
      { $addToSet: { sharedWith: student._id } } // Add the student ID to sharedWith
  );

  if (result.nModified === 0) {
      throw new Error('Resource not found or student already shared with this resource');
  }

  // Return the updated resource
  return await Resourcefile.findById(id);
};


// Function to get all resources shared with a particular student (populated with tutor and student details)
export const getResourcesSharedWithStudent = async (studentId) => {
  try {
    // Find resources where the student is in the sharedWith array and populate details
    const resourcesfile = await Resourcefile.find({ sharedWith: studentId })
      .populate('uploadedBy', 'fname lname') // Populate tutor details
      .populate('sharedWith', 'fname lname'); // Populate student details

    return resourcesfile; // Return the resources
  } catch (error) {
    console.error("Error fetching shared resources:", error);
    throw new Error('Error fetching shared resources'); // Rethrow the error for the router to handle
  }
};


export const removeSharedResource = async (id,studentId) => {
  try {
    const resource = await Resourcefile.findByIdAndUpdate(
      id,
      { $pull: { sharedWith: studentId } },
      { new: true }
    );

    if (!resource) {
      throw new Error('Resource not found');
    }

    return resource;
  } catch (error) {
    throw new Error(`Error removing resource: ${error.message}`);
  }
};


export const deleteResourcefileById = async (id) => {
  try {
    const result = await Resourcefile.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Resourcefile not found');
    }
    return result;
  } catch (error) {
    throw new Error(`Error deleting resourcefile: ${error.message}`);
  }
};
