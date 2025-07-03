// src/pages/admin/teacherRelated/ShowTeachers.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllTeachers } from "../../../redux/teacherRelated/teacherSlice"; // Import from teacher slice
import { deleteUser } from "../../../redux/userRelated/userHandle"; // Assuming common delete function for users
import { Paper, Box, IconButton, Typography, CircularProgress, Button, ButtonGroup, ClickAwayListener, Grow, Popper, MenuItem, MenuList } from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { BlackButton, BlueButton, GreenButton } from "../../../components/buttonStyles"; // Assuming these are common
import TableTemplate from "../../../components/TableTemplate"; // Assuming this is common
import SpeedDialTemplate from "../../../components/SpeedDialTemplate"; // Assuming this is common
import Popup from "../../../components/Popup"; // Assuming this is common

const ShowTeachers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teachersList, loading, error, response } = useSelector(
    (state) => state.teacher // Select from teacher slice
  );
  const { currentUser } = useSelector((state) => state.user); // Get current user (admin)

  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(getAllTeachers(currentUser._id)); // Fetch teachers for the current university
    } else {
      console.warn("currentUser._id is not available. Cannot fetch teachers for a specific university.");
      // Optionally, dispatch getAllTeachers() without ID here if you want to show ALL teachers if admin ID is missing
    }
  }, [currentUser, dispatch]);

  console.log("ShowTeachers Component State:");
  console.log("  teachersList:", teachersList);
  console.log("  loading:", loading);
  console.log("  error:", error);
  console.log("  response:", response);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    // Implement delete logic here. This might be a common user delete or specific to teachers.
    // If it's `deleteUser`, ensure it handles 'Teacher' role.
    dispatch(deleteUser(deleteID, address)).then(() => {
      // Re-fetch teachers after deletion
      if (currentUser && currentUser._id) {
        dispatch(getAllTeachers(currentUser._id));
      } else {
        dispatch(getAllTeachers()); // Fallback to fetching all teachers
      }
    });
  };

  const teacherColumns = [
    { id: "name", label: "Name", minWidth: 170 },
    { id: "empNum", label: "Employee No.", minWidth: 100 }, // Assuming 'empNum' for teacher
    { id: "departmentName", label: "Department", minWidth: 170 }, // Assuming 'departmentName'
    // Add other columns specific to teachers
  ];

  // IMPORTANT: Adjust this mapping based on your actual Teacher model and populated fields
  const teacherRows =
    Array.isArray(teachersList) && teachersList.length > 0
      ? teachersList.map((teacher) => {
          return {
            name: teacher.name,
            empNum: teacher.empNum,
            // Check if department is populated and has departmentName.
            // Adjust based on your backend response structure.
            departmentName: teacher.department ? teacher.department.departmentName : "N/A",
            id: teacher._id,
          };
        })
      : [];

  const TeacherButtonHaver = ({ row }) => {
    const options = ["View Details", "Assign Subjects"]; // Example options

    const [open, setOpen] = useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = () => {
      console.info(`You clicked ${options[selectedIndex]}`);
      if (selectedIndex === 0) {
        handleViewDetails();
      } else if (selectedIndex === 1) {
        handleAssignSubjects();
      }
    };

    const handleViewDetails = () => {
      navigate("/Admin/teachers/teacher/" + row.id); // Example path
    };
    const handleAssignSubjects = () => {
      navigate("/Admin/teachers/teacher/assign-subjects/" + row.id); // Example path
    };

    const handleMenuItemClick = (event, index) => {
      setSelectedIndex(index);
      setOpen(false);
    };

    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    return (
      <>
        <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>
          <PersonRemoveIcon color="error" />
        </IconButton>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
        >
          View
        </BlueButton>
        <React.Fragment>
          <ButtonGroup
            variant="contained"
            ref={anchorRef}
            aria-label="split button"
          >
            <Button onClick={handleClick}>{options[selectedIndex]}</Button>
            <BlackButton
              size="small"
              aria-controls={open ? "split-button-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </BlackButton>
          </ButtonGroup>
          <Popper
            sx={{
              zIndex: 1,
            }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      {options.map((option, index) => (
                        <MenuItem
                          key={option}
                          disabled={index === 2}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </React.Fragment>
      </>
    );
  };

  const actions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />,
      name: "Add New Teacher",
      action: () => navigate("/Admin/addteacher"), // Navigate to Add Teacher page
    },
    {
      icon: <PersonRemoveIcon color="error" />,
      name: "Delete All Teachers",
      action: () => deleteHandler(currentUser._id, "Teachers"), // Assuming this deletes all teachers of the university
    },
  ];

  return (
    <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
      ) : (
        <>
          {response ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                height: "60vh",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                {response}
              </Typography>
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/addteacher")}
              >
                Add Teachers
              </GreenButton>
            </Box>
          ) : (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              {Array.isArray(teachersList) && teachersList.length > 0 ? (
                <TableTemplate
                  buttonHaver={TeacherButtonHaver}
                  columns={teacherColumns}
                  rows={teacherRows}
                />
              ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px",
                        height: "60vh",
                    }}
                >
                    <Typography variant="h6" color="textSecondary">
                        No teacher data available. Please add teachers.
                    </Typography>
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate("/Admin/addteacher")}
                    >
                        Add Teachers
                    </GreenButton>
                </Box>
              )}
              <SpeedDialTemplate actions={actions} />
            </Paper>
          )}
        </>
      )}
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </>
  );
};

export default ShowTeachers;