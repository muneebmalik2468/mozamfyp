const Subject = require("../models/subjectSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Student = require("../models/studentSchema.js");

const subjectCreate = async (req, res) => {
    try {
        const { sclassName, adminID, subjects: newSubjectsArray } = req.body;

        // 1. Prepare subjects for insertion and add sclassName/university IDs
        const subjectsToInsert = newSubjectsArray.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
            sclassName: sclassName, // Assign sclassName directly
            university: adminID,     // Assign university directly
        }));

        // 2. Check for duplicate subCodes *within the current request*
        const incomingSubCodes = newSubjectsArray.map(s => s.subCode);
        const uniqueIncomingSubCodes = new Set(incomingSubCodes);

        if (uniqueIncomingSubCodes.size !== incomingSubCodes.length) {
            // There are duplicates in the array sent from the frontend
            const duplicates = incomingSubCodes.filter((item, index) => incomingSubCodes.indexOf(item) !== index);
            return res.status(400).json({ // Use 400 for client-side input errors
                message: `Duplicate subject codes in your request: ${[...new Set(duplicates)].join(', ')}. Each subject must have a unique code.`,
            });
        }

        // 3. Check for existing subjects in the database for the given university
        const existingSubjectsInDB = await Subject.find({
            subCode: { $in: incomingSubCodes },
            university: adminID,
        });

        if (existingSubjectsInDB.length > 0) {
            // Identify which subCodes are duplicates in the database
            const duplicateSubCodes = existingSubjectsInDB.map(s => s.subCode);
            return res.status(409).json({ // Use 409 Conflict for resource conflicts
                message: `Sorry, the following subject codes already exist for this university: ${duplicateSubCodes.join(', ')}. Subject codes must be unique.`,
            });
        }

        // 4. Insert new subjects
        const result = await Subject.insertMany(subjectsToInsert);
        res.status(201).json(result); // Use 201 Created for successful resource creation

    } catch (err) {
        console.error("Error in subjectCreate:", err); // <-- IMPORTANT: Log the error on your backend

        // Check for specific MongoDB duplicate key error (if a unique index is defined on subCode)
        if (err.code && err.code === 11000) {
            // This is a duplicate key error, usually caught by the findOne check above,
            // but good to have as a fallback if a compound index is missed.
            const field = err.message.split(" dup key: { ")[1].split(": ")[0];
            const value = err.message.split(" dup key: { ")[1].split(": ")[1].split(" }")[0];
            return res.status(409).json({
                message: `A subject with this ${field} '${value}' already exists. Please ensure it's unique.`,
                error: err,
            });
        }
        res.status(500).json({ message: "Internal Server Error during subject creation.", error: err.message });
    }
};

const allSubjects = async (req, res) => {
  try {
    let subjects = await Subject.find({ university: req.params.id }).populate(
      "sclassName",
      "sclassName"
    );
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const classSubjects = async (req, res) => {
  try {
    let subjects = await Subject.find({ sclassName: req.params.id });
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const freeSubjectList = async (req, res) => {
  try {
    let subjects = await Subject.find({
      sclassName: req.params.id,
      teacher: { $exists: false },
    });
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getSubjectDetail = async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);
    if (subject) {
      subject = await subject.populate("sclassName", "sclassName");
      subject = await subject.populate("teacher", "name");
      res.send(subject);
    } else {
      res.send({ message: "No subject found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    // Set the teachSubject field to null in teachers
    await Teacher.updateOne(
      { teachSubject: deletedSubject._id },
      { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
    );

    // Remove the objects containing the deleted subject from students' examResult array
    await Student.updateMany(
      {},
      { $pull: { examResult: { subName: deletedSubject._id } } }
    );

    // Remove the objects containing the deleted subject from students' attendance array
    await Student.updateMany(
      {},
      { $pull: { attendance: { subName: deletedSubject._id } } }
    );

    res.send(deletedSubject);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteSubjects = async (req, res) => {
  try {
    const deletedSubjects = await Subject.deleteMany({
      university: req.params.id,
    });

    // Set the teachSubject field to null in teachers
    await Teacher.updateMany(
      { teachSubject: { $in: deletedSubjects.map((subject) => subject._id) } },
      { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
    );

    // Set examResult and attendance to null in all students
    await Student.updateMany(
      {},
      { $set: { examResult: null, attendance: null } }
    );

    res.send(deletedSubjects);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteSubjectsByClass = async (req, res) => {
  try {
    const deletedSubjects = await Subject.deleteMany({
      sclassName: req.params.id,
    });

    // Set the teachSubject field to null in teachers
    await Teacher.updateMany(
      { teachSubject: { $in: deletedSubjects.map((subject) => subject._id) } },
      { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
    );

    // Set examResult and attendance to null in all students
    await Student.updateMany(
      {},
      { $set: { examResult: null, attendance: null } }
    );

    res.send(deletedSubjects);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  subjectCreate,
  freeSubjectList,
  classSubjects,
  getSubjectDetail,
  deleteSubjectsByClass,
  deleteSubjects,
  deleteSubject,
  allSubjects,
};
