import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sclassesList: [],
  sclassStudents: [],
  sclassDetails: null, // Changed: Should be null for a single detail object, not an array
  subjectsList: [],
  subjectDetails: null, // Changed: Should be null for a single detail object, not an array
  loading: false, // General loading for lists and general details
  subloading: false, // Specific loading for subjectDetails (used by AddTeacher screen)
  error: null,
  response: null, // General response messages (e.g., for getFailed, getSubDetailsSuccess for "not found" messages)
  getresponse: null, // Used for 'no data found' for sclasses/students (by getFailedTwo)
};

const sclassSlice = createSlice({
  name: "sclass",
  initialState,
  reducers: {
    // --- General Request & Success Reducers ---
    getRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.response = null;
      state.getresponse = null; // Clear all previous responses/errors
    },
    getSuccess: (state, action) => {
      state.sclassesList = action.payload;
      state.loading = false;
      state.error = null;
      state.getresponse = null;
    },
    getStudentsSuccess: (state, action) => {
      state.sclassStudents = action.payload;
      state.loading = false;
      state.error = null;
      state.getresponse = null;
    },
    getSubjectsSuccess: (state, action) => { // This is for lists of subjects, not single detail
      state.subjectsList = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
    },
    detailsSuccess: (state, action) => { // For sclassDetails
      state.sclassDetails = action.payload;
      state.loading = false;
      state.error = null;
    },

    // --- Specific Subject Details Reducers (Crucial for Add Teacher Screen) ---
    getSubDetailsRequest: (state) => {
      state.subloading = true;
      state.error = null;
      state.response = null; // Clear general response for subject details
      state.subjectDetails = null; // Clear previous subject details when starting a new fetch
    },
    getSubDetailsSuccess: (state, action) => {
      state.subloading = false;
      state.error = null; // Clear any error on successful fetch (even if 'not found')

      // CRITICAL LOGIC: Differentiate between a valid subject object and a "not found" message
      if (action.payload && typeof action.payload === 'object' && action.payload._id) {
        // Payload is a valid subject object
        state.subjectDetails = action.payload;
        state.response = null; // Clear any previous 'not found' message
      } else if (action.payload && typeof action.payload === 'object' && action.payload.message) {
        // Payload indicates a message (e.g., "No subject found")
        state.subjectDetails = null; // Set to null if not found
        state.response = action.payload.message; // Store the message in 'response'
      } else {
        // Handle unexpected or empty payload
        state.subjectDetails = null;
        state.response = "Unexpected response for subject details.";
      }
    },

    // --- Failure/Error Reducers ---
    getFailed: (state, action) => { // Used for subjectsList failure or no data
      state.subjectsList = [];
      state.response = action.payload; // Contains the failure message
      state.loading = false;
      state.error = null;
    },
    getFailedTwo: (state, action) => { // Used for sclassesList/sclassStudents failure or no data
      state.sclassesList = [];
      state.sclassStudents = [];
      state.getresponse = action.payload; // Contains the failure message
      state.loading = false;
      state.error = null;
    },
    getError: (state, action) => { // General error catcher for any fetch
      state.loading = false;
      state.subloading = false; // IMPORTANT: Reset subloading on error too!
      state.error = action.payload; // Store the error message
      state.response = null; // Clear any previous response message
      state.getresponse = null; // Clear any previous getresponse message
    },

    // --- Reset Reducers ---
    resetSubjects: (state) => {
      state.subjectsList = [];
      state.sclassesList = []; // This action resets both. Make sure this is desired.
      state.response = null;
      state.getresponse = null;
      state.error = null;
      state.loading = false;
      state.subloading = false;
    },
    // Adding a specific action to clear subject details when needed (e.g., navigating away)
    clearSubjectDetails: (state) => {
      state.subjectDetails = null;
      state.subloading = false;
      state.error = null;
      state.response = null;
    }
  },
});

export const {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  getStudentsSuccess,
  getSubjectsSuccess,
  detailsSuccess,
  getFailedTwo,
  resetSubjects,
  getSubDetailsSuccess,
  getSubDetailsRequest,
  clearSubjectDetails, // Export the new action
} = sclassSlice.actions;

export const sclassReducer = sclassSlice.reducer;