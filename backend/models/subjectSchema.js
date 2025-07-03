const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subName: {
        type: String,
        required: false,
        default: null,
    },
    subCode: {
        type: String,
        required: false,
        default: null,
        // If subCode should be globally unique across ALL universities, uncomment:
        // unique: true,
    },
    sessions: {
        type: Number,
        required: false,
        default: null,
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false,
        default: 1,
    },
    university: { // Or adminID, depending on your naming convention for the ref
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Assuming 'Admin' is your Admin model name
        required: false,
        default: null,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher', // Assuming 'Teacher' is your Teacher model name
        default: null,
    },
}, { timestamps: true });

// --- IMPORTANT: ADD THIS COMPOUND UNIQUE INDEX ---
// This ensures that 'subCode' is unique *only within the context of a specific 'university'*.
subjectSchema.index({ subCode: 1, university: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema); // Use consistent casing for model names

module.exports = Subject;
