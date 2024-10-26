import VirtualTutoring from "../../Models/VirtualTutoring.js";


export const createSession = async (payload) => {
  try {
    const newSession = new VirtualTutoring(payload);
    const savedSession = await newSession.save();
    return savedSession;
  } catch (error) {
    throw new Error(`Error creating session: ${error.message}`);
  }
};


export const getAllSessions = async () => {
  try {
    const sessions = await VirtualTutoring.find()
      .populate('tutorId', 'fname') 
      .populate('studentId', 'fname'); 
    return sessions;
  } catch (error) {
    throw new Error(`Error fetching sessions: ${error.message}`);
  }
};


export const getSessionById = async (id) => {
  try {
    const session = await VirtualTutoring.findById(id)
      .populate('tutorId', 'fname') 
      .populate('studentId', 'fname'); 
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  } catch (error) {
    throw new Error(`Error fetching session: ${error.message}`);
  }
};


export const modifySession = async (id, payload) => {
  try {
    const session = await VirtualTutoring.findById(id);
    if (!session) {
      throw new Error('Session not found');
    }

    Object.keys(payload).forEach((key) => {
      session[key] = payload[key];
    });

    const updatedSession = await session.save();
    return updatedSession;
  } catch (error) {
    throw new Error(`Error updating session: ${error.message}`);
  }
};


export const deleteSessionById = async (id) => {
  try {
    const result = await VirtualTutoring.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Session not found');
    }
    return result;
  } catch (error) {
    throw new Error(`Error deleting session: ${error.message}`);
  }
};


export const getSessionsByStudentId = async (studentId) => {
  try {
    const sessions = await VirtualTutoring.find({ studentId })
      .populate('tutorId', 'fname')
      .populate('studentId', 'fname');

    if (!sessions.length) {
      //console.log('No sessions found for this student');
    }

    return sessions;
  } catch (error) {
    throw new Error(`Error fetching sessions for student: ${error.message}`);
  }
};
