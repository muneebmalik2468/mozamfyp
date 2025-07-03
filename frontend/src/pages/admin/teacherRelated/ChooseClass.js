import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle";
import { useNavigate } from "react-router-dom";
import { PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";

const ChooseClass = ({ situation }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, error, getresponse } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser && currentUser._id) { // Ensure currentUser and its ID exist
      dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }
  }, [currentUser, dispatch]); // Added currentUser to dependency array

  if (error) {
    console.error("Error loading classes:", error); // Use console.error
  }

  const navigateHandler = (classID) => {
    if (situation === "Teacher") {
      navigate("/Admin/teachers/choosesubject/" + classID);
    } else if (situation === "Subject") {
      navigate("/Admin/addsubject/" + classID);
    }
  };

  const sclassColumns = [{ id: "name", label: "Class Name", minWidth: 170 }];

  const sclassRows =
    sclassesList &&
    sclassesList.length > 0
      ? sclassesList.map((sclass) => {
          return {
            name: sclass.sclassName,
            id: sclass._id,
          };
        })
      : []; // Ensure it's an empty array if no classes

  const SclassButtonHaver = ({ row }) => {
    return (
      <>
        <PurpleButton
          variant="contained"
          onClick={() => navigateHandler(row.id)}
        >
          Choose
        </PurpleButton>
      </>
    );
  };

  return (
    <>
      {loading ? (
        <div>Loading classes...</div>
      ) : (
        <>
          {getresponse && sclassesList.length === 0 ? ( // Condition for showing "Add Class" button only when no classes found
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <Typography variant="h6" gutterBottom>
                No classes found.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/Admin/addclass")}
                sx={{ ml: 2 }} // Added margin-left for spacing
              >
                Add Class
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom component="div">
                Choose a class
              </Typography>
              {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                <TableTemplate
                  buttonHaver={SclassButtonHaver}
                  columns={sclassColumns}
                  rows={sclassRows}
                />
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No classes available. Please add a class first.
                </Typography>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ChooseClass;