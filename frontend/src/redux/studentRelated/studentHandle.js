// src/redux/studentRelated/studentHandle.js

// Import the async thunks from the studentSlice
import {
  getAllStudents,
  registerUser, // Assuming registerUser is now in studentSlice
  updateStudentFields,
  removeStuff, // Rename this to something more specific like deleteStudent
  underControl, // If you need to dispatch underControl from a component
} from "./studentSlice";

// Re-export them for convenience if other parts of your app import from handle files
export {
  getAllStudents,
  registerUser,
  updateStudentFields,
  removeStuff,
  underControl,
};

// If you had more complex logic that *needed* to be in this file,
// it would look like this, but typically you'd just dispatch the thunks directly.
// Example:
/*
export const someComplexStudentAction = (data) => async (dispatch) => {
  try {
    // Some complex logic before dispatching a thunk or direct API call
    dispatch(registerUser(data)); // Dispatching the thunk
  } catch (error) {
    console.error("Complex action failed", error);
  }
};
*/