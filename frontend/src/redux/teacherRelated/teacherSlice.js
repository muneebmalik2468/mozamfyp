// src/redux/teacherRelated/teacherSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Async Thunks ---

export const registerTeacher = createAsyncThunk(
    'teacher/registerTeacher',
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
            return rejectWithValue(error.message || "An unknown error occurred during teacher registration.");
        }
    }
);

// Updated: getAllTeachers Thunk (from teacherHandle.js)
export const getAllTeachers = createAsyncThunk(
    'teacher/getAllTeachers',
    async (id = null, { rejectWithValue }) => { // Accept 'id' (universityId), default to null
        try {
            const url = id ? `${process.env.REACT_APP_BASE_URL}/Teachers/${id}` : `${process.env.REACT_APP_BASE_URL}/Teachers`;
            const response = await axios.get(url);

            if (response.data && response.data.message) {
                return rejectWithValue(response.data.message); // Reject with message for "No teachers found"
            }
            console.log("Fetched teachers (payload):", response.data);
            return response.data; // Should be an array of teacher objects
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "An unknown error occurred while fetching teachers.");
        }
    }
);

// NEW: getTeacherDetails Thunk (from teacherHandle.js)
export const getTeacherDetails = createAsyncThunk(
    'teacher/getTeacherDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);
            // Assuming that if data exists, it's a success; otherwise, you might need specific message checks.
            if (response.data) {
                return response.data; // Return the teacher details
            } else {
                return rejectWithValue("Teacher not found.");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "An unknown error occurred while fetching teacher details.");
        }
    }
);

// NEW: updateTeachSubject Thunk (from teacherHandle.js)
export const updateTeachSubject = createAsyncThunk(
    'teacher/updateTeachSubject',
    async ({ teacherId, teachSubject }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/TeacherSubject`,
                { teacherId, teachSubject },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            // Assuming success if status is OK and no specific error message
            if (response.status === 200) {
                 return response.data; // Return any success message/data from backend
            } else {
                return rejectWithValue("Failed to update teacher subject.");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || "An unknown error occurred while updating teacher subject.");
        }
    }
);


const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        status: 'idle',
        teachersList: [],
        loading: false,
        error: null,
        response: null,
        currentTeacher: null, // To store details of a single teacher fetched by getTeacherDetails
        // You might also have a list of departments for dropdowns if teachers are assigned to them
        // departmentsList: [],
        // departmentsLoading: false,
        // departmentsError: null,
    },
    reducers: {
        underTeacherControl: (state) => {
            state.status = 'idle';
            state.response = null;
            state.error = null;
            state.currentTeacher = null; // Clear specific teacher data too
        },
    },
    extraReducers: (builder) => {
        builder
            // registerTeacher cases
            .addCase(registerTeacher.pending, (state) => { state.status = 'loading'; state.error = null; state.response = null; })
            .addCase(registerTeacher.fulfilled, (state, action) => { state.status = 'added'; state.currentTeacher = action.payload; state.response = null; state.error = null; })
            .addCase(registerTeacher.rejected, (state, action) => { state.status = 'failed'; state.response = action.payload; state.error = null; })

            // getAllTeachers cases
            .addCase(getAllTeachers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
                state.teachersList = [];
            })
            .addCase(getAllTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.teachersList = action.payload;
                state.error = null;
                state.response = null;
            })
            .addCase(getAllTeachers.rejected, (state, action) => {
                state.loading = false;
                state.teachersList = [];
                state.error = null;
                state.response = action.payload;
            })

            // NEW: getTeacherDetails cases
            .addCase(getTeacherDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
                state.currentTeacher = null; // Clear previous details
            })
            .addCase(getTeacherDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTeacher = action.payload; // Store the single teacher object
                state.error = null;
                state.response = null;
            })
            .addCase(getTeacherDetails.rejected, (state, action) => {
                state.loading = false;
                state.currentTeacher = null;
                state.error = action.payload; // This is an error state for details fetch
                state.response = null; // Or `action.payload` if you want message here
            })

            // NEW: updateTeachSubject cases
            .addCase(updateTeachSubject.pending, (state) => {
                state.status = 'loading'; // Using generic 'status' for this one
                state.error = null;
                state.response = null;
            })
            .addCase(updateTeachSubject.fulfilled, (state, action) => {
                state.status = 'stuffDone'; // A common status for successful updates
                state.response = action.payload.message || "Subject updated successfully"; // Assuming a message or default
                state.error = null;
                // You might want to update currentTeacher or teachersList here if the UI needs to reflect the change immediately
            })
            .addCase(updateTeachSubject.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload;
                state.response = null;
            });
    },
});

export const { underTeacherControl } = teacherSlice.actions;
export default teacherSlice.reducer;