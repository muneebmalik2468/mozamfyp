const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: "",
  },
  rollNum: {
    type: Number,
    required: false,
    default: 0,
  },
  password: {
    type: String,
    required: false,
    default: "",
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sclass",
    required: false,
    default: null,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: false,
    default: null,
  },
  role: {
    type: String,
    default: "Student",
  },
  examResult: [
    {
      subName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
      },
      marksObtained: {
        type: Number,
        default: 0,
      },
    },
  ],
  attendance: [
    {
      date: {
        type: Date,
        required: false,
      },
      status: {
        type: String,
        enum: ["Present", "Absent"],
        required: false,
      },
      subName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("student", studentSchema);
