import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, underControl } from "../../../redux/studentRelated/studentSlice"; // Adjust path as needed
import Popup from "../../../components/Popup";
import { CircularProgress, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { styled } from "@mui/system";

// Custom styled components (adjust or use global styles as per your project)
const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  maxWidth: '500px',
  margin: '40px auto',
});

const Title = styled(Typography)({
  textAlign: 'center',
  marginBottom: '24px',
  fontWeight: 'bold',
  color: '#3f51b5', // Example color
});

const StyledButton = styled(Button)({
  marginTop: '20px',
  padding: '12px',
  fontSize: '1rem',
});

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams(); // Keep params if you need them for other logic

    // You can remove currentUser if adminID is hardcoded and not derived from it
    // const { status, currentUser, response, error } = useSelector((state) => state.student);
    const { status, response, error } = useSelector((state) => state.student); // Adjusted useSelector

    const [name, setName] = useState("");
    const [rollNum, setRollNum] = useState("");
    const [password, setPassword] = useState("");

    // --- HARDCODED VALUES ---
    // Replace with actual IDs from your database for testing
    const hardcodedAdminID = "6863c643147af32f85260729"; // Example Admin ID
    const hardcodedSclassId = "6863c650147af32f85260741"; // Example Class ID
    // ------------------------

    const role = "Student";

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // If adminID and sclassId are hardcoded, you likely don't need these effects
    // You also won't need to fetch sclassesList if you're not populating a dropdown
    useEffect(() => {
      // This useEffect to fetch classes and handle initial selection is no longer needed
      // if sclassName and adminID are hardcoded.
      // You can remove the dispatch(getAllSclasses) call.
    }, []); // Empty dependency array means it runs once on mount, but its content is irrelevant now

    const submitHandler = (event) => {
        event.preventDefault();

        setLoader(true);

        const fields = {
            name,
            rollNum,
            password,
            sclassName: hardcodedSclassId, // Using the hardcoded class ID
            adminID: hardcodedAdminID,     // Using the hardcoded admin ID
            role,
        };

        dispatch(registerUser({ fields, role }));
    };

    // Effect to handle Redux status changes after registration attempt
    useEffect(() => {
        if (status === "added") {
            setMessage("Student added successfully!");
            setShowPopup(true);
            setLoader(false);
            dispatch(underControl());
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } else if (status === "failed") {
            setMessage(response || "Registration failed. Please try again.");
            setShowPopup(true);
            setLoader(false);
            dispatch(underControl());
        } else if (status === "error") {
            setMessage(error || "Network error. Please check your connection.");
            setShowPopup(true);
            setLoader(false);
            dispatch(underControl());
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <FormContainer onSubmit={submitHandler}>
                <Title variant="h4">Add Student</Title>

                <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    autoComplete="name"
                />

                {/* The Class selection dropdown is no longer needed if hardcoding */}
                {/* Remove this entire block:
                {situation === "Student" && (
                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Class</InputLabel>
                        <Select
                            value={selectedClassName}
                            onChange={handleClassChange}
                            label="Class"
                            disabled={sclassesLoading}
                        >
                            <MenuItem value="">Select Class</MenuItem>
                            {sclassesLoading ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} /> Loading Classes...
                                </MenuItem>
                            ) : sclassesError ? (
                                <MenuItem disabled>Error loading classes: {sclassesError}</MenuItem>
                            ) : sclassesList && sclassesList.length > 0 ? (
                                sclassesList.map((classItem) => (
                                    <MenuItem key={classItem._id} value={classItem.sclassName}>
                                        {classItem.sclassName}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No Classes Found</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                )}
                */}
                {/* You can add a disabled text field or just omit it if you want to show the hardcoded class name */}
                <TextField
                    label="Class Name (Hardcoded)"
                    variant="outlined"
                    value="Hardcoded Class" // You can put a descriptive name here
                    fullWidth
                    disabled // Disable user input
                />
                 <TextField
                    label="University ID (Hardcoded)"
                    variant="outlined"
                    value="Hardcoded University" // You can put a descriptive name here
                    fullWidth
                    disabled // Disable user input
                />

                <TextField
                    label="Roll Number"
                    variant="outlined"
                    type="number"
                    value={rollNum}
                    onChange={(e) => setRollNum(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    autoComplete="new-password"
                />

                <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loader}
                >
                    {loader ? <CircularProgress size={24} color="inherit" /> : "Add Student"}
                </StyledButton>
            </FormContainer>

            <Popup
                message={message}
                setShowPopup={setShowPopup}
                showPopup={showPopup}
            />
        </Box>
    );
};

export default AddStudent;