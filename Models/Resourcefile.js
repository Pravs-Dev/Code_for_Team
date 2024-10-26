import mongoose from 'mongoose';

const ResourcefileSchema = new mongoose.Schema({
  file: {
    data: {
      type: Buffer, 
      required: true,
    },
    contentType: {
      type: String, 
      required: true,
    },
    originalName: {
      type: String, 
      required: true,
    },
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to students
    },
  tags: [{ type: String }],
}, { timestamps: true });

const Resourcefile = mongoose.model('Resourcefile', ResourcefileSchema);
export default Resourcefile;
