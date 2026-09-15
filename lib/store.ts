import { configureStore } from '@reduxjs/toolkit';
import fileReducer from '@/features/fileSlice';
import userReducer from '@/features/userSlice';

export const store = configureStore({
  reducer: {
    file: fileReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
