import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import bgpic from "../assets/designlogin.jpg";
import { LightPurpleButton } from "../components/buttonStyles";
import styled from "styled-components";
import { loginUser } from "../redux/userRelated/userHandle";
import Popup from "../components/Popup";

const defaultTheme = createTheme();

const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userState = useSelector((state) => state.user); // Moved to top level
  const { status, currentUser, response, error, currentRole, token } = userState;

  const [toggle, setToggle] = useState(false);
  const [guestLoader, setGuestLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === "Student") {
      const rollNum = event.target.rollNumber.value;
      const studentName = event.target.studentName.value;
      const password = event.target.password.value;

      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }
      const fields = { rollNum, studentName, password };
      console.log("Login payload:", fields, "Role:", role, "RememberMe:", rememberMe);
      setLoader(true);
      dispatch(loginUser(fields, role, rememberMe));
    } else {
      const email = event.target.email.value;
      const password = event.target.password.value;

      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }

      const fields = { email, password };
      console.log("Login payload:", fields, "Role:", role, "RememberMe:", rememberMe);
      setLoader(true);
      dispatch(loginUser(fields, role, rememberMe));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === "email") setEmailError(false);
    if (name === "password") setPasswordError(false);
    if (name === "rollNumber") setRollNumberError(false);
    if (name === "studentName") setStudentNameError(false);
  };

  const guestModeHandler = () => {
    const password = "zxc";

    if (role === "Admin") {
      const email = "malikshery@12";
      const fields = { email, password };
      console.log("Guest login payload:", fields, "Role:", role, "RememberMe:", rememberMe);
      setGuestLoader(true);
      dispatch(loginUser(fields, role, rememberMe));
    } else if (role === "Student") {
      const rollNum = "1";
      const studentName = "Dipesh Awasthi";
      const fields = { rollNum, studentName, password };
      console.log("Guest login payload:", fields, "Role:", role, "RememberMe:", rememberMe);
      setGuestLoader(true);
      dispatch(loginUser(fields, role, rememberMe));
    } else if (role === "Teacher") {
      const email = "malik@12";
      const fields = { email, password };
      console.log("Guest login payload:", fields, "Role:", role, "RememberMe:", rememberMe);
      setGuestLoader(true);
      dispatch(loginUser(fields, role, rememberMe));
    }
  };

  useEffect(() => {
    console.log("useEffect triggered:", {
      status,
      currentUser: currentUser ? "present" : "null",
      currentRole,
      token: token ? "present" : "null",
      response,
      error,
      roleProp: role,
      sessionToken: sessionStorage.getItem("token") || "no token",
      fullState: JSON.stringify(userState),
    });
    if (status === "success" && currentUser && currentRole === role) {
      console.log(`Navigating to /${role}/dashboard`);
      navigate(`/${role}/dashboard`, { replace: true });
      setLoader(false);
      setGuestLoader(false);
    } else if (status === "failed") {
      console.log("Login failed:", response?.message);
      setMessage(response?.message || "Invalid credentials");
      setShowPopup(true);
      setLoader(false);
      setGuestLoader(false);
    } else if (status === "error") {
      console.log("Login error:", error?.message);
      setMessage(error?.message || "Network Error");
      setShowPopup(true);
      setLoader(false);
      setGuestLoader(false);
    } else {
      console.log("No navigation: conditions not met", {
        status,
        hasCurrentUser: !!currentUser,
        roleMatch: currentRole === role,
      });
      const storedToken = sessionStorage.getItem("token");
      if (storedToken && role === "Admin") {
        console.log("Workaround: Token found, forcing navigation to /Admin/dashboard");
        navigate("/Admin/dashboard", { replace: true });
        setLoader(false);
        setGuestLoader(false);
      }else if (storedToken && role === "Student") {
        console.log("Workaround: Token found, forcing navigation to /Student/dashboard");
        navigate("/Student/dashboard", { replace: true });
        setLoader(false);
        setGuestLoader(false);
      } 
    }
  }, [status, currentUser, currentRole, token, navigate, error, response, role, userState]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, color: "#2c2143" }}>
              {role} Login
            </Typography>
            <Typography variant="h7">
              Welcome back! Please enter your details
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 2 }}
            >
              {role === "Student" ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="rollNumber"
                    label="Enter your Roll Number"
                    name="rollNumber"
                    autoComplete="off"
                    type="number"
                    autoFocus
                    error={rollNumberError}
                    helperText={rollNumberError && "Roll Number is required"}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="studentName"
                    label="Enter your name"
                    name="studentName"
                    autoComplete="name"
                    autoFocus
                    error={studentNameError}
                    helperText={studentNameError && "Name is required"}
                    onChange={handleInputChange}
                  />
                </>
              ) : (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Enter your email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={emailError}
                  helperText={emailError && "Email is required"}
                  onChange={handleInputChange}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={toggle ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && "Password is required"}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setToggle(!toggle)}>
                        {toggle ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Grid
                container
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Remember me"
                />
                <StyledLink to="/forgot-password">Forgot password?</StyledLink>
              </Grid>
              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                {loader ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </LightPurpleButton>
              {/* <Button
                fullWidth
                onClick={guestModeHandler}
                variant="outlined"
                sx={{ mt: 2, mb: 3, color: "#7f56da", borderColor: "#7f56da" }}
              >
                Login as Guest
              </Button> */}
              {role === "Admin" && (
                <Grid container>
                  <Grid>Don't have an account?</Grid>
                  <Grid item sx={{ ml: 2 }}>
                    <StyledLink to="/Adminregister">Sign up</StyledLink>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${bgpic})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={guestLoader}
      >
        <CircularProgress color="primary" />
        Please Wait
      </Backdrop>
      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </ThemeProvider>
  );
};

export default LoginPage;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;