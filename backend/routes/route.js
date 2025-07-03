const router = require("express").Router();
const jwt = require("jsonwebtoken");



const AuthMiddleware = (req, res, next) => {
  const Token = req.header("Authorization")?.replace("Bearer ", "");
  if (!Token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(Token, process.env.JWT_SECRET || "dfdgssxcbcfbfasdnakcn7g&87y9b@hcnc");
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};


const authMiddleware = (req, res, next) => {
  // const token = req.header("Authorization")?.replace("Bearer ", "");
  const token = "sdfdsf";
  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET || "dfdgssxcbcfbfasdnakcn7g&87y9b@hcnc");
    // req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Controllers
const {
  adminRegister,
  adminLogIn,
  getAdminDetail,
} = require("../controllers/admin-controller.js");

const {
  sclassCreate,
  sclassList,
  deleteSclass,
  deleteSclasses,
  getSclassDetail,
  getSclassStudents,
} = require("../controllers/class-controller.js");
const {
  complainCreate,
  complainList,
} = require("../controllers/complain-controller.js");
const {
  noticeCreate,
  noticeList,
  deleteNotices,
  deleteNotice,
  updateNotice,
} = require("../controllers/notice-controller.js");
const {
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
} = require("../controllers/student_controller.js");
const {
  subjectCreate,
  classSubjects,
  deleteSubjectsByClass,
  getSubjectDetail,
  deleteSubject,
  freeSubjectList,
  allSubjects,
  deleteSubjects,
} = require("../controllers/subject-controller.js");
const {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  deleteTeachers,
  deleteTeachersByClass,
  deleteTeacher,
  updateTeacherSubject,
  teacherAttendance,
} = require("../controllers/teacher-controller.js");

// Admin Routes
router.post("/AdminReg", adminRegister);
router.post("/AdminLogin", adminLogIn);

router.get("/Admin/:id", authMiddleware, getAdminDetail);

// Student Routes
router.post("/StudentReg", studentRegister);
router.post("/StudentLogin", studentLogIn);

router.get("/Students/:id", authMiddleware, getStudents);
router.get("/Student/:id", authMiddleware, getStudentDetail);

router.delete("/Students/:id", authMiddleware, deleteStudents);
router.delete("/StudentsClass/:id", authMiddleware, deleteStudentsByClass);
router.delete("/Student/:id", authMiddleware, deleteStudent);

router.put("/Student/:id", authMiddleware, updateStudent);

router.put("/UpdateExamResult/:id", authMiddleware, updateExamResult);

router.put("/StudentAttendance/:id", authMiddleware, studentAttendance);

router.put(
  "/RemoveAllStudentsSubAtten/:id",
  authMiddleware,
  clearAllStudentsAttendanceBySubject
);
router.put("/RemoveAllStudentsAtten/:id", authMiddleware, clearAllStudentsAttendance);

router.put("/RemoveStudentSubAtten/:id", authMiddleware, removeStudentAttendanceBySubject);
router.put("/RemoveStudentAtten/:id", authMiddleware, removeStudentAttendance);

// Teacher Routes
router.post("/TeacherReg", teacherRegister);
router.post("/TeacherLogin", teacherLogIn);

router.get("/Teachers/:id", authMiddleware, getTeachers);
router.get("/Teacher/:id", authMiddleware, getTeacherDetail);

router.delete("/Teachers/:id", authMiddleware, deleteTeachers);
router.delete("/TeachersClass/:id", authMiddleware, deleteTeachersByClass);
router.delete("/Teacher/:id", authMiddleware, deleteTeacher);

router.put("/TeacherSubject", authMiddleware, updateTeacherSubject);

router.post("/TeacherAttendance/:id", authMiddleware, teacherAttendance);

// Notice Routes
router.post("/NoticeCreate", authMiddleware, noticeCreate);

router.get("/NoticeList/:id", authMiddleware, noticeList);

router.delete("/Notices/:id", authMiddleware, deleteNotices);
router.delete("/Notice/:id", authMiddleware, deleteNotice);

router.put("/Notice/:id", authMiddleware, updateNotice);

// Complain Routes
router.post("/ComplainCreate", authMiddleware, complainCreate);

router.get("/ComplainList/:id", authMiddleware, complainList);

// Sclass Routes
router.post("/SclassCreate", authMiddleware, sclassCreate);

router.get("/SclassList/:id", authMiddleware, sclassList);
router.get("/Sclass/:id", authMiddleware, getSclassDetail);

router.get("/Sclass/Students/:id", authMiddleware, getSclassStudents);

router.delete("/Sclasses/:id", authMiddleware, deleteSclasses);
router.delete("/Sclass/:id", authMiddleware, deleteSclass);

// Subject Routes
router.post("/SubjectCreate", authMiddleware, subjectCreate);

router.get("/AllSubjects/:id", authMiddleware, allSubjects);
router.get("/ClassSubjects/:id", authMiddleware, classSubjects);
router.get("/FreeSubjectList/:id", authMiddleware, freeSubjectList);
router.get("/Subject/:id", authMiddleware, getSubjectDetail);

router.delete("/Subject/:id", authMiddleware, deleteSubject);
router.delete("/Subjects/:id", authMiddleware, deleteSubjects);
router.delete("/SubjectsClass/:id", authMiddleware, deleteSubjectsByClass);

module.exports = router;