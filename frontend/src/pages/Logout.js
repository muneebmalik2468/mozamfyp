import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Typography, Box } from "@mui/material";
import styled from "styled-components";
import { authLogout } from "../redux/userRelated/userSlice";

const Logout = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear tokens from both sessionStorage and localStorage
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    dispatch(authLogout());
    navigate("/");
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <LogoutContainer>
      <Typography variant="h5" sx={{ mb: 2, color: "#2c2143" }}>
        {currentUser ? currentUser.name : "User"}
      </Typography>
      <LogoutMessage>Are you sure you want to log out?</LogoutMessage>
      <Button
        variant="contained"
        sx={{ mt: 2, backgroundColor: "#ea0606", "&:hover": { backgroundColor: "#c50505" } }}
        onClick={handleLogout}
      >
        Log Out
      </Button>
      <Button
        variant="contained"
        sx={{
          mt: 2,
          backgroundColor: "rgb(99, 60, 99)",
          "&:hover": { backgroundColor: "rgb(79, 40, 79)" },
        }}
        onClick={handleCancel}
      >
        Cancel
      </Button>
    </LogoutContainer>
  );
};

export default Logout;

const LogoutContainer = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
  background-color: #85769f66;
  color: black;
  width: 300px;
  margin: 50px auto;
`;

const LogoutMessage = styled(Typography)`
  margin-bottom: 20px;
  font-size: 16px;
  text-align: center;
`;