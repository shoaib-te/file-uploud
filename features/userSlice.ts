import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export interface User {
  _id: string
  fullName: string
  email: string
  avatar?: string
  createdAt?: string
}

interface UserState {
  currentUser: User | null
  loading: boolean
  error: string | null
  otpSent: boolean
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  otpSent: false,
}

function apiError(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.error || fallback : fallback
}

export const requestSignInOtp = createAsyncThunk('user/requestSignInOtp', async (email: string, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/sign-in', { email }, { withCredentials: true })
    return response.data
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to send OTP'))
  }
})

export const verifyOtp = createAsyncThunk('user/verifyOtp', async (otp: string, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/email-otp', { otp }, { withCredentials: true })
    return response.data.user as User
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Invalid or expired OTP'))
  }
})

export const signUpUser = createAsyncThunk('user/signUpUser', async ({ email, fullName }: { email: string; fullName: string }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/sign-up', { email, fullName }, { withCredentials: true })
    return response.data
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to create account'))
  }
})

export const logoutUser = createAsyncThunk('user/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await axios.post('/api/logout', {}, { withCredentials: true })
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to sign out'))
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: { payload: User | null }) => {
      state.currentUser = action.payload
    },
    clearUser: (state) => {
      state.currentUser = null
      state.otpSent = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestSignInOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(requestSignInOtp.fulfilled, (state) => {
        state.loading = false
        state.otpSent = true
      })
      .addCase(requestSignInOtp.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to send OTP'
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.otpSent = false
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'Invalid or expired OTP'
      })
      .addCase(signUpUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to create account'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null
        state.otpSent = false
      })
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
