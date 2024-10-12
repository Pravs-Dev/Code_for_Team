import Feedback from '../../Models/Feedback.js';

//Create new Feedback
export const createFeedback = async (payload) => {
    try {
        const newFeedback = new Feedback(payload);
        const savedFeedback = await newFeedback.save();
        return savedFeedback;
    } catch (error) {
        throw new Error(`Error creating feedback: ${error.message}`);
    }
};

export const getAllFeedback = async (page = 0, limit = 10) => {
    try {
        const feedbacks = await Feedback.find()
            .limit(limit)
            .skip(page * limit);  // Pagination
        if (!feedbacks) throw new Error('No feedback found');
        return feedbacks;
    } catch (error) {
        throw new Error(`Error fetching feedback: ${error.message}`);
    }
};


//Get the feedback of a session
export const getFeedbackBySession = async (id) => {
    try {
        const feedback = await Feedback.find({session: id});
        if (!feedback) throw new Error('Feedback not found');
        return feedback;
    } catch (error) {
        throw new Error(`Error fetching feedback: ${error.message}`);
    }
};


// Updated getTutorFeedback to populate tutor details
export const getTutorFeedback = async (id, page = 0) => {
    try {
        const feedback = await Feedback.find({ tutor: id })
            .populate('tutor','fname lname')
            .limit(10)
            .skip(page * 10);

        if (!feedback) throw new Error('Feedback not found');
        return feedback;
    } catch (error) {
        throw new Error(`Error fetching feedback: ${error.message}`);
    }
};



//Change Session Feedback
export const updateFeedback = async (id, payload) => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
        if (!updatedFeedback) throw new Error('Feedback not found');
        return updatedFeedback;
    } catch (error) {
        throw new Error(`Error updating feedback: ${error.message}`);
    }
};


//Delete Feedback
export const deleteFeedback = async (id) => {
    try {
        const result = await Feedback.findByIdAndDelete(id);
        if (!result) throw new Error('Feedback not found');
        return result;
    } catch (error) {
        throw new Error(`Error deleting feedback: ${error.message}`);
    }
};

