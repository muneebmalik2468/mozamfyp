import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userRelated/userSlice"; // Default import
import studentReducer from "./studentRelated/studentSlice"; // Default import
import teacherSlice from "./teacherRelated/teacherSlice"; // Default import
import {noticeReducer} from "./noticeRelated/noticeSlice"; // Default import
import {complainReducer} from "./complainRelated/complainSlice"; // Default import
import {sclassReducer }from "./sclassRelated/sclassSlice"; // Default import

const store = configureStore({
  reducer: {
    user: userSlice,
    student: studentReducer,
    teacher: teacherSlice,
    notice: noticeReducer,
    // complain: complainSlice,
    sclass: sclassReducer,
  },middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

console.log("Initial store state:", store.getState());
export default store;