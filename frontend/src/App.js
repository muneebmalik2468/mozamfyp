// src/App.js

import React, { useEffect } from "react"; // Import useEffect
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch
import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ShowClasses from "./pages/admin/classRelated/ShowClasses";
import ShowSubjects from "./pages/admin/subjectRelated/ShowSubjects";
import AddClass from "./pages/admin/classRelated/AddClass";
import ShowTeachers from "./pages/admin/teacherRelated/ShowTeachers";
import SubjectForm from "./pages/admin/subjectRelated/SubjectForm";
import AddTeacher from "./pages/admin/teacherRelated/AddTeacher";
import ShowStudents from "./pages/admin/studentRelated/ShowStudents";
import AddStudent from "./pages/admin/studentRelated/AddStudent";
import LoginPage from "./pages/LoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import ChooseUser from "./pages/ChooseUser";
import { checkAuthStatus } from "./redux/userRelated/userHandle"; // Import the new action
import StudentSubjects from "./pages/student/StudentSubjects";

const ProtectedRoute = ({ role, children }) => {
  const { currentRole, status } = useSelector((state) => state.user); // Get 'status' from Redux state

  console.log("ProtectedRoute check:", { currentRole, requiredRole: role, status }); // Debug

  // If the authentication status is still being loaded, show a loading indicator
  // This prevents premature redirects before the Redux state is rehydrated.
  if (status === 'loading') {
    // You can replace this with a proper loading spinner component
    return <div>Loading authentication...</div>;
  }

  // If not loading, then check if the role matches or is missing
  if (!currentRole || currentRole !== role) {
    console.log("Redirecting to / due to unauthorized access or missing role after load.");
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch(); // Initialize useDispatch
  const { currentRole } = useSelector((state) => state.user);

  // Dispatch checkAuthStatus on initial component mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]); // Run once on mount

  console.log("App rendering, currentRole:", currentRole);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        
        <Route path="/choose" element={<ChooseUser visitor="normal" />} />
        <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

        <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
        <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
        <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />

        <Route path="/Adminregister" element={<AdminRegisterPage />} />

        {/* Use /* for nested routes if your dashboards have sub-paths */}
        <Route
          path="/Admin/dashboard/*"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/Admin/classes/*"
          element={
            <ProtectedRoute role="Admin">
              <ShowClasses />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/Admin/addclass/*"
          element={
            <ProtectedRoute role="Admin">
              <AddClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/subjects/chooseclass*"
          element={
            <ProtectedRoute role="Admin">
              <SubjectForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/teachers/*"
          element={
            <ProtectedRoute role="Admin">
              <ShowTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/teachers/chooseclass*"
          element={
            <ProtectedRoute role="Admin">
              <AddTeacher />
            </ProtectedRoute>
          }
        />
        
         <Route
          path="/Admin/subjects/*"
          element={
            <ProtectedRoute role="Admin">
              <ShowSubjects/>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/Admin/addstudents/*"
          element={
            <ProtectedRoute role="Admin">
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/students/*"
          element={
            <ProtectedRoute role="Admin">
              <ShowStudents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Student/dashboard/*"
          element={
            
              <StudentDashboard />
            
          }
        />
        <Route
          path="/Student/subjects/*"
          element={
            
              <StudentSubjects />
            
          }
        />
        <Route
          path="/Teacher/dashboard/*"
          element={
            <ProtectedRoute role="Teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* This catch-all route should always be the last one */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;