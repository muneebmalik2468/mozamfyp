// src/pages/admin/teacherRelated/TeacherDetails.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
// Corrected imports:
import { getTeacherDetails, underTeacherControl } from "../../../redux/teacherRelated/teacherSlice";
// If you have a separate thunk for deleting or updating teacher fields, import them here
// import { updateTeacherFields } from "../../../redux/teacherRelated/teacherSlice";
// import { deleteUser } from "../../../redux/userRelated/userHandle"; // If deleting from here

import { Box, Typography, Button, CircularProgress, Paper } from "@mui/material";
import Popup from "../../../components/Popup";

const TeacherDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // Get teacher ID from URL

  const {
    currentTeacher,
    loading,
    error,
    response,
    status // If you have update/delete actions here, monitor their status
  } = useSelector((state) => state.teacher);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getTeacherDetails(id));
    }
  }, [id, dispatch]);

  // You might have effects for update/delete actions here as well
  // For example, if you edit a teacher's details:
  // useEffect(() => {
  //   if (status === 'stuffDone') { // Example status after an update
  //     setMessage("Teacher details updated successfully!");
  //     setShowPopup(true);
  //     dispatch(underTeacherControl());
  //     // Optionally re-fetch details or navigate away
  //   }
  // }, [status, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (response) {
    return <Typography color="textSecondary">{response}</Typography>;
  }

  if (!currentTeacher) {
    return <Typography>Teacher not found.</Typography>;
  }

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>Teacher Details</Typography>
      <Typography variant="body1"><strong>Name:</strong> {currentTeacher.name}</Typography>
      <Typography variant="body1"><strong>Email:</strong> {currentTeacher.email}</Typography>
      <Typography variant="body1"><strong>Employee Number:</strong> {currentTeacher.empNum}</Typography>
      <Typography variant="body1">
        <strong>Department:</strong> {currentTeacher.department ? currentTeacher.department.departmentName : 'N/A'}
      </Typography>
      {/* Display other teacher-specific fields */}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => navigate(`/Admin/teachers/edit/${currentTeacher._id}`)}>
          Edit Teacher
        </Button>
        <Button variant="outlined" color="error" onClick={() => {
          // Implement delete logic here, using deleteUser or a specific deleteTeacher thunk
          setMessage("Delete functionality not yet implemented here."); // Placeholder
          setShowPopup(true);
        }}>
          Delete Teacher
        </Button>
        <Button variant="outlined" onClick={() => navigate(`/Admin/teachers/assign-subject/${currentTeacher._id}`)}>
          Assign Subject
        </Button>
      </Box>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Paper>
  );
};

export default TeacherDetails;