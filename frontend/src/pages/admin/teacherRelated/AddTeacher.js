// src\pages\admin\teacherRelated\AddTeacher.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
// import { getSubjectDetails } from "../../../redux/sclassRelated/sclassHandle"; // <-- Keep commented out for now
import Popup from "../../../components/Popup";
import { registerUser } from "../../../redux/userRelated/userHandle";
import { CircularProgress } from "@mui/material";

const AddTeacher = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- TEMPORARY HARDCODED DATA START ---
  // IMPORTANT: Replace these with actual valid IDs from your database if you have them,
  // or mock ones that match your expected data structure.
  const hardcodedSubjectDetails = {
    _id: "654e4c27f68c707204856f65", // Example Subject ID
    subName: "Mathematics", // Example Subject Name
    subCode: "MATH101", // Example Subject Code
    university: "654e4c27f68c707204856f66", // Example University ID
    sclassName: {
      _id: "654e4c27f68c707204856f67", // Example Class ID
      sclassName: "Class 10 A", // Example Class Name
    },
    // Add any other properties your subjectDetails object might have if your form needs them
  };

  // Simulate Redux state for subjectDetails when hardcoding
  const subjectDetails = hardcodedSubjectDetails;
  // These variables are not strictly needed when hardcoding, but declared for completeness
  // if you uncomment the Redux fetch later.
  // const sclassLoading = false;
  // const sclassError = null;
  // const sclassResponse = null;
  // --- TEMPORARY HARDCODED DATA END ---

  // --- Comment out or remove the useEffect that fetches data ---
  // useEffect(() => {
  //   if (subjectID) {
  //     dispatch(getSubjectDetails(subjectID, "Subject"));
  //   }
  // }, [dispatch, subjectID]);

  // Renamed 'status' to 'userStatus', 'response' to 'userResponse', 'error' to 'userError'
  // to resolve ESLint 'no-restricted-globals' and 'no-undef' errors.
  const { status: userStatus, response: userResponse, error: userError } = useSelector((state) => state.user);

  // We are not using sclassLoading, sclassError, sclassResponse from Redux because we're hardcoding
  // but if you were, you'd destructure them like:
  // const { loading: sclassLoading, error: sclassLoadError, response: sclassLoadResponse } = useSelector((state) => state.sclass);


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false); // For form submission loading indicator

  const role = "Teacher";

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true); // Activate loader on form submission

    // Basic validation for hardcoded data (can be expanded)
    if (!subjectDetails || !subjectDetails._id || !subjectDetails.university || !subjectDetails.sclassName || !subjectDetails.sclassName._id) {
        setMessage("Hardcoded subject details are incomplete. Please check the mock data provided in the code.");
        setShowPopup(true);
        setLoader(false); // Deactivate loader if data is incomplete
        return;
    }

    const fields = {
      name,
      email,
      password,
      role,
      university: subjectDetails.university,
      teachSubject: subjectDetails._id,
      teachSclass: subjectDetails.sclassName._id,
    };

    dispatch(registerUser(fields, role));
  };

  // This useEffect monitors the Redux user state for registration outcomes
  useEffect(() => {
    if (userStatus === "added") {
      setMessage("Teacher added successfully!");
      setShowPopup(true);
      setLoader(false); // Deactivate loader on success
      setTimeout(() => {
        setShowPopup(false);
        navigate("/Admin/teachers"); // Navigate after showing success
      }, 2000);
    } else if (userStatus === "failed") {
      setMessage(userResponse || "Registration failed."); // Use userResponse
      setShowPopup(true);
      setLoader(false); // Deactivate loader on failure
    } else if (userStatus === "error") {
      setMessage(userError?.message || "Network Error"); // Use userError
      setShowPopup(true);
      setLoader(false); // Deactivate loader on error
    }
  }, [userStatus, navigate, userError, userResponse, dispatch]); // Updated dependencies

  // When hardcoding, we assume data is always ready, so this is always false.
  // This bypasses the loading spinner for subject details.
  const isDataLoadingOrInvalid = false;

  return (
    <div>
      <div className="register">
        <form className="registerForm" onSubmit={submitHandler}>
          <span className="registerTitle">Add Teacher</span>
          <br />

          {/* This block will now always render the form directly because isDataLoadingOrInvalid is false */}
          {isDataLoadingOrInvalid ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <CircularProgress size={24} color="inherit" />
              <p>Loading subject details...</p> {/* This message will not be shown */}
            </div>
          ) : (
            <>
              {/* Display hardcoded subject and class details */}
              <label>Subject : {subjectDetails.subName}</label>
              <label>
                Class : {subjectDetails.sclassName?.sclassName}
              </label>

              {/* Input fields for new teacher details */}
              <label>Name</label>
              <input
                className="registerInput"
                type="text"
                placeholder="Enter teacher's name..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />

              <label>Email</label>
              <input
                className="registerInput"
                type="email"
                placeholder="Enter teacher's email..."
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <label>Password</label>
              <input
                className="registerInput"
                type="password"
                placeholder="Enter teacher's password..."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                className="registerButton"
                type="submit"
                disabled={loader} // Button is disabled only when form is submitting
              >
                {loader ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Register"
                )}
              </button>
            </>
          )}
        </form>
      </div>
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </div>
  );
};

export default AddTeacher;