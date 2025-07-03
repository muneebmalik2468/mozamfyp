import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    status: 'idle', // Set an initial 'idle' status for clarity
    currentUser: null,
    currentRole: null,
    token: null,
    response: null,
    error: null,
  },
  reducers: {
    // 'authLogout' is defined here as a direct reducer
    // because you dispatch it directly as { type: "authLogout" } in userHandle.js
    // If you plan to dispatch it as userSlice.actions.authLogout() later, this is fine.
    // If you consistently use plain objects, it could also be in extraReducers.
    authLogout(state) {
      state.status = 'idle'; // Reset to idle on logout
      state.currentUser = null;
      state.currentRole = null;
      state.token = null;
      state.response = null;
      state.error = null;
    },
    // Any other direct reducers for user-specific actions can go here
  },
  // extraReducers are used to handle actions dispatched from *outside* this slice
  // which is exactly what your userHandle.js is doing.
  extraReducers: (builder) => {
    builder
      .addCase('LOGIN_REQUEST', (state) => { // Matches { type: "LOGIN_REQUEST" }
        state.status = "loading";
        state.response = null;
        state.error = null;
      })
      .addCase('LOGIN_SUCCESS', (state, action) => { // Matches { type: "LOGIN_SUCCESS" }
        state.status = "success";
        state.currentUser = action.payload.currentUser;
        state.currentRole = action.payload.currentRole;
        state.token = action.payload.token;
        state.response = null;
        state.error = null;
      })
      .addCase('LOGIN_FAIL', (state, action) => { // Matches { type: "LOGIN_FAIL" }
        state.status = "failed";
        state.response = action.payload.message || action.payload; // Assuming payload might be object or string
        state.error = null;
        state.currentUser = null; // Clear user on failed login
        state.currentRole = null;
        state.token = null;
      })
      .addCase('underControl', (state) => { // Matches { type: "underControl" }
        state.status = 'idle'; // Reset status after these actions
        state.response = null;
        state.error = null;
      });
  },
});

// We only export authLogout as an action creator if it's meant to be dispatched as userSlice.actions.authLogout()
// If you consistently dispatch { type: "authLogout" }, you don't need to export it here.
export const { authLogout } = userSlice.actions;

export default userSlice.reducer;