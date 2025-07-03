// src/redux/studentRelated/studentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Async Thunks ---

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async ({ fields, role }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.data.message) {
                return rejectWithValue(response.data.message);
            }
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "An unknown error occurred during registration.");
        }
    }
);

// UPDATED: getAllStudents Thunk to accept 'id' and handle try/catch
export const getAllStudents = createAsyncThunk(
    'student/getAllStudents',
    async (id = null, { rejectWithValue }) => { // Accept 'id', default to null if not provided
        try {
            const url = id ? `${process.env.REACT_APP_BASE_URL}/Students/${id}` : `${process.env.REACT_APP_BASE_URL}/Students`;
            const response = await axios.get(url);

            // If the backend sends a 'message' property, it usually indicates no data or an error state.
            // We'll reject this to flow to the 'rejected' extraReducer case.
            if (response.data && response.data.message) {
                return rejectWithValue(response.data.message);
            }
            console.log("Fetched students (payload):", response.data); // Should be an array
            return response.data; // This MUST be an array of student objects
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "An unknown error occurred while fetching students.");
        }
    }
);

export const updateStudentFields = createAsyncThunk(
    'student/updateStudentFields',
    async ({ id, fields, address }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.data.message) {
                return rejectWithValue(response.data.message);
            }
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "Failed to update student.");
        }
    }
);

export const removeStuff = createAsyncThunk(
    'student/removeStuff',
    async ({ id, address }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
            if (response.data.message) {
                return rejectWithValue(response.data.message);
            }
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "Failed to remove item.");
        }
    }
);

export const getAllSclasses = createAsyncThunk(
    'sclass/getAllSclasses',
    async (adminId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${adminId}`);
            if (response.data.message) {
                return response.data.message; // Consider if this should be rejectWithValue for consistency
            }
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "Failed to fetch classes.");
        }
    }
);

const studentSlice = createSlice({
    name: 'student',
    initialState: {
        status: 'idle',
        currentUser: null, // Assuming currentUser comes from user slice, not student slice
        response: null,
        error: null,
        tempStudent: null,
        studentsList: [],
        loading: false,
        sclassesList: [],
        sclassesLoading: false,
        sclassesError: null,
        sclassesResponse: null,
    },
    reducers: {
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; state.response = null; })
            .addCase(registerUser.fulfilled, (state, action) => { state.status = 'added'; state.tempStudent = action.payload; state.response = null; state.error = null; })
            .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.response = action.payload; state.error = null; })

            // UPDATED: getAllStudents extraReducers to handle messages from rejectWithValue
            .addCase(getAllStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
                state.studentsList = []; // Clear list on new fetch request
            })
            .addCase(getAllStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.studentsList = action.payload; // This MUST be an array
                state.error = null;
                state.response = null; // Clear any previous 'no students found' message
            })
            .addCase(getAllStudents.rejected, (state, action) => {
                state.loading = false;
                state.studentsList = []; // Ensure list is empty on rejection
                state.error = null; // Clear general error, as the specific message is in 'response'
                state.response = action.payload; // This will hold the "No students found" message or actual error messages
            })

            .addCase(updateStudentFields.pending, (state) => { state.status = 'loading'; state.error = null; state.response = null; })
            .addCase(updateStudentFields.fulfilled, (state, action) => { state.status = 'stuffDone'; state.tempStudent = action.payload; state.response = null; state.error = null; })
            .addCase(updateStudentFields.rejected, (state, action) => { state.status = 'error'; state.error = action.payload; state.response = null; })

            .addCase(removeStuff.pending, (state) => { state.status = 'loading'; state.error = null; state.response = null; })
            .addCase(removeStuff.fulfilled, (state, action) => { state.status = 'stuffDone'; state.response = null; state.error = null; })
            .addCase(removeStuff.rejected, (state, action) => { state.status = 'error'; state.error = action.payload; state.response = null; })

            .addCase(getAllSclasses.pending, (state) => { state.sclassesLoading = true; state.sclassesError = null; state.sclassesResponse = null; })
            .addCase(getAllSclasses.fulfilled, (state, action) => {
                state.sclassesLoading = false;
                if (typeof action.payload === 'string') {
                    state.sclassesList = [];
                    state.sclassesResponse = action.payload;
                } else {
                    state.sclassesList = action.payload;
                    state.sclassesResponse = null;
                }
                state.sclassesError = null;
            })
            .addCase(getAllSclasses.rejected, (state, action) => { state.sclassesLoading = false; state.sclassesError = action.payload; state.sclassesResponse = null; });
    },
});

export const { underControl } = studentSlice.actions;
export default studentSlice.reducer;