const bcrypt = require("bcrypt");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");

const teacherRegister = async (req, res) => {
  const { name, email, password, role, university, teachSubject, teachSclass } =
    req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const teacher = new Teacher({
      name,
      email,
      password: hashedPass,
      role,
      university,
      teachSubject,
      teachSclass,
    });

    const existingTeacherByEmail = await Teacher.findOne({ email });

    if (existingTeacherByEmail) {
      res.send({ message: "Email already exists" });
    } else {
      let result = await teacher.save();
      await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
      result.password = undefined;
      res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const teacherLogIn = async (req, res) => {
  try {
    const { email, password } = req.body; // Destructure email and password from req.body

    // 1. Find the teacher by email
    let teacher = await Teacher.findOne({ email });

    // 2. Check if teacher exists
    if (!teacher) {
      return res.status(401).send({ message: "Teacher not found" }); // Use 401 for unauthorized/not found
    }

    // 3. Check if the teacher object has a password field before comparing
    // This handles cases where a user might exist but was created without a password, or selected explicitly for no password.
    if (!teacher.password) {
      // This scenario might mean the password field is not selected in your schema or is missing.
      // If your schema excludes password by default, ensure you add .select('+password') to your findOne query.
      // Example: let teacher = await Teacher.findOne({ email }).select('+password');
      return res.status(401).send({ message: "Password not set for this account." });
    }

    // 4. Validate the password
    const validated = await bcrypt.compare(password, teacher.password);

    if (!validated) {
      return res.status(401).send({ message: "Invalid password" }); // Use 401 for invalid credentials
    }

    // 5. Populate related fields
    // Use optional chaining with populate to prevent errors if the referenced field is null/undefined
    // Or, ensure your data integrity prevents broken references.
    try {
      teacher = await teacher
        .populate("teachSubject", "subName sessions")
        .populate("university", "universityName")
        .populate("teachSclass", "sclassName");
    } catch (populateError) {
      console.error("Mongoose Populate Error during teacher login:", populateError);
      // You might want to log this error but still send the teacher data if login itself was successful
      // or send a specific message to the client.
      // For now, we'll log and continue, but this might be the source of your 500.
      return res.status(500).json({ message: "Login successful, but some related data could not be loaded. Please check data integrity.", error: populateError.message });
    }

    // 6. Remove password before sending to client
    teacher.password = undefined;

    // 7. Send the teacher object to the client
    res.status(200).send(teacher); // Use 200 for successful operations

  } catch (err) {
    // Catch any other unexpected errors during the process
    console.error("Unexpected error during teacher login:", err);
    res.status(500).json({ message: "An unexpected server error occurred.", error: err.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const universityId = req.params.id; // Get the ID from the request parameters

    let teachers;

    if (universityId) {
        // CORRECTED: Filter teachers by the university ID
        teachers = await Teacher.find({  }) // <--- THIS IS THE KEY CHANGE
            
        console.log("Attempting to fetch teachers for university ID:", universityId);
    } else {
        // If no universityId is provided (e.g., frontend calls /Teachers)
        // Fetch all teachers in the database.
        teachers = await Teacher.find({})
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        console.log("Fetching all teachers (no university ID provided).");
    }

    if (teachers.length > 0) {
      let modifiedTeachers = teachers.map((teacher) => {
        return { ...teacher._doc, password: undefined };
      });
      res.status(200).send(modifiedTeachers); // Explicit 200 OK
    } else {
      res.status(200).send({ message: "No teachers found" }); // Explicit 200 OK with message
    }
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Internal server error", error: err.message }); // Better error message
  }
};
const getTeacherDetail = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id)
      .populate("teachSubject", "subName sessions")
      .populate("university", "universityName")
      .populate("teachSclass", "sclassName");
    if (teacher) {
      teacher.password = undefined;
      res.send(teacher);
    } else {
      res.send({ message: "No teacher found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateTeacherSubject = async (req, res) => {
  const { teacherId, teachSubject } = req.body;
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { teachSubject },
      { new: true }
    );

    await Subject.findByIdAndUpdate(teachSubject, {
      teacher: updatedTeacher._id,
    });

    res.send(updatedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    await Subject.updateOne(
      { teacher: deletedTeacher._id, teacher: { $exists: true } },
      { $unset: { teacher: 1 } }
    );

    res.send(deletedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeachers = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({
      university: req.params.id,
    });

    const deletedCount = deletionResult.deletedCount || 0;

    if (deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
      return;
    }

    const deletedTeachers = await Teacher.find({ university: req.params.id });

    await Subject.updateMany(
      {
        teacher: { $in: deletedTeachers.map((teacher) => teacher._id) },
        teacher: { $exists: true },
      },
      { $unset: { teacher: "" }, $unset: { teacher: null } }
    );

    res.send(deletionResult);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeachersByClass = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({
      sclassName: req.params.id,
    });

    const deletedCount = deletionResult.deletedCount || 0;

    if (deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
      return;
    }

    const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

    await Subject.updateMany(
      {
        teacher: { $in: deletedTeachers.map((teacher) => teacher._id) },
        teacher: { $exists: true },
      },
      { $unset: { teacher: "" }, $unset: { teacher: null } }
    );

    res.send(deletionResult);
  } catch (error) {
    res.status(500).json(error);
  }
};

const teacherAttendance = async (req, res) => {
  const { status, date } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.send({ message: "Teacher not found" });
    }

    const existingAttendance = teacher.attendance.find(
      (a) => a.date.toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      teacher.attendance.push({ date, status });
    }

    const result = await teacher.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance,
};
