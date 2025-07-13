// src/redux/userRelated/userHandle.js

import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000",
// });

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "https://mozamfyp-backend.vercel.app",
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- ADD THIS NEW FUNCTION ---
export const checkAuthStatus = () => async (dispatch) => {
  dispatch({ type: "LOGIN_REQUEST" }); // Indicate loading state for auth check

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  if (token) {
    let currentRole = null;
    let currentUser = null; // Initialize currentUser

    try {
      // Decode the JWT token to get the payload
      // JWTs are base64-encoded in three parts: header.payload.signature
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const decodedPayload = JSON.parse(atob(tokenParts[1]));
        currentRole = decodedPayload.role; // Assuming 'role' is in your JWT payload
        currentUser = decodedPayload.user || null; // Assuming 'user' object might be in payload
      } else {
        console.warn("Invalid token format during rehydration.");
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        dispatch({ type: "authLogout" }); // Clear state if token is malformed
        return;
      }

      if (currentRole) {
        dispatch({
          type: "LOGIN_SUCCESS", // Reuse LOGIN_SUCCESS to hydrate state
          payload: {
            token: token,
            currentUser: currentUser, // Pass the user object if available
            currentRole: currentRole,
          },
        });
        console.log("Redux state rehydrated from storage.");
      } else {
        // If token exists but no role found (e.g., old token, malformed)
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        dispatch({ type: "authLogout" });
      }
    } catch (e) {
      console.error("Failed to decode or process token during rehydration:", e);
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      dispatch({ type: "authLogout" }); // Clear state on error
    }
  } else {
    // If no token found in storage, ensure Redux state is clean
    dispatch({ type: "authLogout" });
    console.log("No token found in storage, Redux state cleared.");
  }
};
// --- END OF NEW FUNCTION ---

export const loginUser = (fields, role, rememberMe = false) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    let endpoint;
    if (role === "Admin") {
      endpoint = "/AdminLogin";
    } else if (role === "Student") {
      endpoint = "/StudentLogin";
    } else if (role === "Teacher") {
      endpoint = "/TeacherLogin";
    } else {
      throw new Error("Invalid role");
    }

    console.log("Login API request:", { endpoint, fields, rememberMe });
    const response = await api.post(endpoint, fields);
    const { token, user } = response.data;
    console.log("Login API response:", response.data);

    if (token) {
      if (rememberMe) {
        localStorage.setItem("token", token);
        console.log("Token stored in localStorage:", token);
      } else {
        sessionStorage.setItem("token", token);
        console.log("Token stored in sessionStorage:", token);
      }
    } else {
      console.warn("No token received in response");
    }

    console.log("Dispatching LOGIN_SUCCESS:", { token, user, role });
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: {
        token,
        currentUser: user,
        currentRole: role,
      },
    });
  } catch (error) {
    console.error("Login error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Login failed",
      },
    });
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  dispatch({ type: "authLogout" });
};

export const registerUser = (fields, role, rememberMe = false) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    let endpoint;
    if (role === "Admin") {
      endpoint = "/AdminReg";
    } else if (role === "Student") {
      endpoint = "/StudentReg";
    } else if (role === "Teacher") {
      endpoint = "/TeacherReg";
    } else {
      throw new Error("Invalid role");
    }

    console.log("Register API request:", { endpoint, fields, rememberMe });
    const response = await api.post(endpoint, fields);
    const { token, user } = response.data;
    console.log("Register API response:", response.data);

    if (token) {
      if (rememberMe) {
        localStorage.setItem("token", token);
        console.log("Token stored in localStorage:", token);
      } else {
        sessionStorage.setItem("token", token);
        console.log("Token stored in sessionStorage:", token);
      }
    } else {
      console.warn("No token received in response");
    }

    console.log("Dispatching LOGIN_SUCCESS:", { token, user, role });
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: {
        token,
        currentUser: user,
        currentRole: role,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Register error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Registration failed",
      },
    });
    throw error;
  }
};

export const addStuff = (fields, endpoint) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    const response = await api.post(endpoint, fields);
    dispatch({ type: "underControl" });
    return response.data;
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Failed to add",
      },
    });
    throw error;
  }
};

export const deleteUser = (id, endpoint) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    await api.delete(`${endpoint}/${id}`);
    dispatch({ type: "underControl" });
    return { success: true };
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Deletion failed",
      },
    });
    throw error;
  }
};

export const getUserDetails = (id, endpoint) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    const response = await api.get(`${endpoint}/${id}`);
    dispatch({ type: "underControl" });
    return response.data;
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Failed to fetch details",
      },
    });
    throw error;
  }
};

export const updateUser = (id, fields, endpoint) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });
    const response = await api.put(`${endpoint}/${id}`, fields);
    dispatch({ type: "underControl" });
    return response.data;
  } catch (error) {
    dispatch({
      type: "LOGIN_FAIL",
      payload: {
        message: error.response?.data?.message || "Update failed",
      },
    });
    throw error;
  }
};