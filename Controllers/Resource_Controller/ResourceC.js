import Resource from "../../Models/Resources.js"; 
import User from '../../Models/User.js';

export const createResource = async (payload) => {
  try {
    console.log("Creating resource with payload:", payload); 
    const newResource = new Resource(payload);
    const savedResource = await newResource.save();
    return savedResource;
  } catch (error) {
    console.error("Error creating resource:", error);
    throw new Error(`Error creating resource: ${error.message}`);
  }
};


export const getUserResources = async (req, res) => {
  try {
      const userId = req.user.id; 
      const resources = await Resource.find({ uploadedBy: userId });
      
      return resources;
  } catch (error) {
      throw new Error({ message: 'Error fetching resources', error: error.message });
  }
};


export const getAllResources = async () => {
  try {
    const resources = await Resource.find();
    return resources;
  } catch (error) {
    throw new Error(`Error fetching resources: ${error.message}`);
  }
};


export const getResourceById = async (id) => {
  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  } catch (error) {
    throw new Error(`Error fetching resource: ${error.message}`);
  }
};


export const modifyResource = async (id, payload) => {
  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      throw new Error('Resource not found');
    }

    Object.keys(payload).forEach((key) => {
      resource[key] = payload[key];
    });

    const updatedResource = await resource.save();
    return updatedResource;
  } catch (error) {
    throw new Error(`Error updating resource: ${error.message}`);
  }
};

export const shareResourceWithStudentByName = async (id, studentName, tutorId) => {
  // Find the student by first and last name
  const student = await User.findOne({ fname: studentName.fname, lname: studentName.lname, role: 'student' });
  if (!student) throw new Error('Student not found with the provided names');

  // Update the resource directly
  const result = await Resource.updateOne(
      { _id: id, uploadedBy: tutorId, sharedWith: { $ne: student._id } }, // Ensure the student is not already in the array
      { $addToSet: { sharedWith: student._id } } // Add the student ID to sharedWith
  );

  if (result.nModified === 0) {
      throw new Error('Resource not found or student already shared with this resource');
  }

  // Return the updated resource
  return await Resource.findById(id);
};


// Function to get all resources shared with a particular student (populated with tutor and student details)
export const getResourcesSharedWithStudent = async (studentId) => {
  try {
    // Find resources where the student is in the sharedWith array and populate details
    const resources = await Resource.find({ sharedWith: studentId })
      .populate('uploadedBy', 'fname lname') // Populate tutor details
      .populate('sharedWith', 'fname lname'); // Populate student details

    return resources; // Return the resources
  } catch (error) {
    console.error("Error fetching shared resources:", error);
    throw new Error('Error fetching shared resources'); // Rethrow the error for the router to handle
  }
};


export const deleteResourceById = async (id) => {
  try {
    const result = await Resource.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Resource not found');
    }
    return result;
  } catch (error) {
    throw new Error(`Error deleting resource: ${error.message}`);
  }
};

