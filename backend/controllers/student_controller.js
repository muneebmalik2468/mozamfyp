const bcrypt = require("bcrypt");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");
const jwt = require("jsonwebtoken"); // Make sure jsonwebtoken is imported

const studentRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // UNCOMMENT AND ENSURE THIS IS CORRECT
    const existingStudent = await Student.findOne({
      rollNum: req.body.rollNum,
      university: req.body.adminID, // Make sure this matches your schema field name
      sclassName: req.body.sclassName,
    });

    if (existingStudent) {
      // Changed status to 409 Conflict as it's a client error (duplicate)
      return res.status(409).send({ message: "Roll Number already exists in this class for this university." });
    } else {
      const student = new Student({
        ...req.body,
        university: req.body.adminID, // Correctly map adminID to university
        password: hashedPass,
      });

      let result = await student.save();

      result = result.toObject(); // Convert Mongoose document to plain object
      delete result.password; // Remove password from response
      res.status(201).send(result); // Use 201 Created for successful resource creation
    }
  } catch (err) {
    console.error("Error during student registration:", err); // Log the actual error
    res.status(500).json({ message: "Internal server error during registration.", error: err.message });
  }
};

const studentLogIn = async (req, res) => {
  try {
    const { rollNum, studentName, password } = req.body; // Destructure for clarity

    // 1. Find the student by rollNum and name
    let student = await Student.findOne({
      rollNum: rollNum,
      name: studentName,
    }).select('+password'); // Ensure password is selected if your schema has `select: false`

    // 2. Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" }); // Use 404 Not Found
    }

    // 3. Check if password field exists on the student object before comparing
    if (!student.password) {
        // This scenario might mean the password field is not selected in your schema or is missing.
        // If your schema excludes password by default, ensure you add .select('+password') to your findOne query.
        return res.status(500).json({ message: "Authentication error: Password field missing for this account." });
    }

    // 4. Validate the password
    const validated = await bcrypt.compare(password, student.password);

    if (!validated) {
      return res.status(401).json({ message: "Invalid credentials" }); // Use 401 Unauthorized
    }

    // 5. Populate related fields (if successful)
    // Use .toObject() to get a plain JS object before modifying it
    student = await student.populate("university", "universityName");
    student = await student.populate("sclassName", "sclassName");

    // 6. Generate JWT Token
    const payload = {
      id: student._id,
      role: "Student", // Ensure this matches the role property in your student model if it exists
    };
    // Use a secure secret key from your environment variables
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_super_secret_jwt_key", // IMPORTANT: Use a strong, unique secret
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // 7. Prepare student data for response (remove sensitive fields)
    const studentResponse = student.toObject(); // Convert Mongoose document to plain JS object
    delete studentResponse.password;
    delete studentResponse.examResult; // Remove examResult from response
    delete studentResponse.attendance; // Remove attendance from response

    // 8. Send successful response with user data and token
    res.status(200).json({
      message: "Login successful", // Optional message
      user: studentResponse, // Frontend expects 'user' property
      token: token,            // Frontend expects 'token' property
    });
  } catch (err) {
    console.error("Error during student login:", err); // Log the detailed error
    res.status(500).json({ message: "Login failed", error: err.message }); // Consistent 500 status with message
  }
};



const getStudents = async (req, res) => {
  try {
    const universityId = req.params.id; // Get the ID from the request parameters

    let students;

    if (universityId) {
      students = await Student.find({}).populate(
        "sclassName",
        "sclassName"
      );
      console.log("Students fetched for university ID:", universityId);
    } else {
      students = await Student.find({}).populate(
        "sclassName",
        "sclassName"
      );
    }

    if (students.length > 0) {
      let modifiedStudents = students.map((student) => {
        const studentObj = student.toObject();
        delete studentObj.password;
        return studentObj;
      });
      res.status(200).send(modifiedStudents); // Use 200 OK for success
    } else {
      // Send a 200 OK with a message if no students are found,
      // as it's not an error, but an expected scenario.
      // The frontend's rejectWithValue will pick this up from response.data.message
      res.status(200).send({ message: "No students found" });
    }
  } catch (err) {
    console.error("Error fetching students:", err);
    // Send a 500 status for actual server errors
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


const getStudentDetail = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id)
    if (student) {
      student.password = undefined;
      res.send(student);
    } else {
      res.send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ university: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      res.body.password = await bcrypt.hash(res.body.password, salt);
    }
    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateExamResult = async (req, res) => {
  const { subName, marksObtained } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const existingResult = student.examResult.find(
      (result) => result.subName.toString() === subName
    );

    if (existingResult) {
      existingResult.marksObtained = marksObtained;
    } else {
      student.examResult.push({ subName, marksObtained });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const subject = await Subject.findById(subName);

    const existingAttendance = student.attendance.find(
      (a) =>
        a.date.toDateString() === new Date(date).toDateString() &&
        a.subName.toString() === subName
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      // Check if the student has already attended the maximum number of sessions
      const attendedSessions = student.attendance.filter(
        (a) => a.subName.toString() === subName
      ).length;

      if (attendedSessions >= subject.sessions) {
        return res.send({ message: "Maximum attendance limit reached" });
      }

      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
  const subName = req.params.id;

  try {
    const result = await Student.updateMany(
      { "attendance.subName": subName },
      { $pull: { attendance: { subName } } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendance = async (req, res) => {
  const universityId = req.params.id;

  try {
    const result = await Student.updateMany(
      { university: universityId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendanceBySubject = async (req, res) => {
  const studentId = req.params.id;
  const subName = req.body.subId;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $pull: { attendance: { subName: subName } } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendance = async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,

  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};
