import mongoose from 'mongoose';


const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true,"Please enter the title"],
  },
  description: {
    type: String,
    required:false,
    
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to students
    },
    tags: [{ type: String }]

}, { timestamps: true }); 


const Resource = mongoose.model('Resource', ResourceSchema);
export default Resource;

