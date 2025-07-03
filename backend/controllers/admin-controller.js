const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema.js");
const Sclass = require("../models/sclassSchema.js");
const Student = require("../models/studentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Notice = require("../models/noticeSchema.js");
const Complain = require("../models/complainSchema.js");

const adminRegister = async (req, res) => {
  try {
    const { name, email, password, universityName, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !universityName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing admin or university
    const existingAdminByEmail = await Admin.findOne({ email });
    const existingUniversity = await Admin.findOne({ universityName });

    if (existingAdminByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (existingUniversity) {
      return res.status(400).json({ message: "University name already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      universityName,
      role: role || "Admin",
    });

    const result = await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: result._id, role: result.role },
      process.env.JWT_SECRET || "your_jwt_secret", 
      { expiresIn: "1h" }
    );

    // Remove password from response
    const adminResponse = result.toObject();
    delete adminResponse.password;

    // Send response with user data and token
    res.status(201).json({
      user: adminResponse,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

const adminLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const validated = await bcrypt.compare(password, admin.password);
    if (!validated) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "jfyfjtnxfnzxbnzxn4zdnz", 
      { expiresIn: "1h" }
    );

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    // Send response with user data and token
    res.status(200).json({
      user: adminResponse,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const getAdminDetail = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "No admin found" });
    }

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json(adminResponse);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin details", error: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "No admin found" });
    }

    // Delete related data
    await Sclass.deleteMany({ university: req.params.id });
    await Student.deleteMany({ university: req.params.id });
    await Teacher.deleteMany({ university: req.params.id });
    await Subject.deleteMany({ university: req.params.id });
    await Notice.deleteMany({ university: req.params.id });
    await Complain.deleteMany({ university: req.params.id });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json(adminResponse);
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { password, ...otherFields } = req.body;

    // Hash password if provided
    let updateFields = { ...otherFields };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "No admin found" });
    }

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json(adminResponse);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };