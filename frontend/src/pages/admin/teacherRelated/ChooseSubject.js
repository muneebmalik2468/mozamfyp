// src/pages/admin/teacherRelated/ChooseSubject.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
// Corrected imports:
import { getTeacherDetails, updateTeachSubject, underTeacherControl } from "../../../redux/teacherRelated/teacherSlice";
// If you need to fetch subjects (e.g., from a subjectSlice), import that too
// import { getAllSubjects } from "../../../redux/subjectRelated/subjectSlice";

import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import Popup from "../../../components/Popup";

const ChooseSubject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: teacherId } = useParams(); // Get teacher ID from URL params

  const {
    currentTeacher, // Details of the teacher being edited
    loading,
    error,
    response,
    status // For action status like 'stuffDone' from updateTeachSubject
  } = useSelector((state) => state.teacher);

  // If you have a separate subjects slice:
  // const { subjectsList, subjectsLoading, subjectsError } = useSelector((state) => state.subject);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false); // To manage button loading state

  useEffect(() => {
    // Fetch teacher details when component mounts or teacherId changes
    if (teacherId) {
      dispatch(getTeacherDetails(teacherId));
    }
    // Fetch all available subjects (if you have a separate subject slice)
    // dispatch(getAllSubjects(currentUser._id)); // Assuming subjects are per university
  }, [teacherId, dispatch]); // Add subjectsList or other dependencies if needed

  useEffect(() => {
    if (status === 'stuffDone') {
      setMessage("Subject assigned successfully!");
      setShowPopup(true);
      setLoader(false);
      dispatch(underTeacherControl()); // Reset status
      setTimeout(() => navigate(-1), 1500); // Go back after success
    } else if (status === 'error' || status === 'failed') { // Adjust based on your slice's error handling
      setMessage(error || response || "Failed to assign subject.");
      setShowPopup(true);
      setLoader(false);
      dispatch(underTeacherControl()); // Reset status
    }
  }, [status, error, response, dispatch, navigate]);


  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedSubject) {
      setMessage("Please select a subject.");
      setShowPopup(true);
      return;
    }
    setLoader(true);
    dispatch(updateTeachSubject({ teacherId, teachSubject: selectedSubject }));
  };

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

  if (response) { // E.g., if getTeacherDetails yields a 'not found' message
    return <Typography color="textSecondary">{response}</Typography>;
  }

  // Ensure currentTeacher is available before rendering the form
  if (!currentTeacher) {
    return <Typography>Teacher details not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Assign Subject to {currentTeacher.name}</Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="subject-select-label">Select Subject</InputLabel>
          <Select
            labelId="subject-select-label"
            value={selectedSubject}
            label="Select Subject"
            onChange={handleSubjectChange}
            // disabled={subjectsLoading} // If fetching subjects from another slice
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {/* Render your actual subjects list here */}
            {/* Example assuming subjectsList from a subjects slice */}
            {/* {subjectsList && subjectsList.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subjectName}
              </MenuItem>
            ))} */}
             <MenuItem value="65e64e10b14421d00c3b24f5">Mathematics</MenuItem> {/* Example hardcoded for testing */}
             <MenuItem value="65e64e10b14421d00c3b24f6">Physics</MenuItem>
             <MenuItem value="65e64e10b14421d00c3b24f7">Chemistry</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" disabled={loader}>
          {loader ? <CircularProgress size={24} color="inherit" /> : "Assign Subject"}
        </Button>
      </form>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Box>
  );
};

export default ChooseSubject;