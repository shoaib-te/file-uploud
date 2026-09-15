import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export type FileType = 'document' | 'image' | 'video' | 'audio' | 'other'

export interface FileItem {
  _id: string
  name: string
  url: string
  type: FileType
  size: number
  extension: string
  owner?: string
  bucketFileId?: string
  users?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface DashboardCategory {
  name: 'image' | 'other' | 'media' | 'document'
  bytes: number
  size: string
  percentage: number
}

export interface DashboardStats {
  storageUsedBytes: number
  storageUsed: string
  storageLimitBytes: number
  storageLimit: string
  usedPercentage: number
  collectionsCount: number
  lastUpdated: string
  categories: DashboardCategory[]
}

interface FileState {
  files: FileItem[]
  selectedFile: FileItem | null
  dashboard: DashboardStats | null
  loading: boolean
  dashboardLoading: boolean
  error: string | null
}

const initialState: FileState = {
  files: [],
  selectedFile: null,
  dashboard: null,
  loading: false,
  dashboardLoading: false,
  error: null,
}

function apiError(error: unknown, fallback: string) {
  return axios.isAxiosError(error) ? error.response?.data?.error || fallback : fallback
}

export const fetchFiles = createAsyncThunk('file/fetchFiles', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/files', { withCredentials: true })
    return response.data.data as FileItem[]
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to load files'))
  }
})

export const fetchDashboardStats = createAsyncThunk('file/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/dashboard', { withCredentials: true })
    return response.data as DashboardStats
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to load dashboard statistics'))
  }
})

export const uploadFile = createAsyncThunk('file/uploadFile', async (file: File, { rejectWithValue }) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post('/api/files', formData, { withCredentials: true })
    return response.data.data as FileItem
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to upload file'))
  }
})

export const updateFileName = createAsyncThunk('file/updateFileName', async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/files/${id}`, { name }, { withCredentials: true })
    return response.data.data as FileItem
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to rename file'))
  }
})

export const deleteFile = createAsyncThunk('file/deleteFile', async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/files/${id}`, { withCredentials: true })
    return id
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to delete file'))
  }
})

export const shareFile = createAsyncThunk('file/shareFile', async ({ id, userEmailToShare }: { id: string; userEmailToShare: string }, { rejectWithValue }) => {
  try {
    const response = await axios.patch(`/api/files/${id}`, { userEmailToShare }, { withCredentials: true })
    return response.data.data as FileItem
  } catch (error: unknown) {
    return rejectWithValue(apiError(error, 'Unable to share file'))
  }
})

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.files = action.payload
    },
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files.unshift(action.payload)
    },
    setSelectedFile: (state, action: PayloadAction<FileItem | null>) => {
      state.selectedFile = action.payload
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((file) => file._id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to load files'
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardLoading = true
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false
        state.dashboard = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to load dashboard statistics'
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.files.unshift(action.payload)
      })
      .addCase(updateFileName.fulfilled, (state, action) => {
        state.files = state.files.map((file) => file._id === action.payload._id ? action.payload : file)
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file._id !== action.payload)
      })
      .addCase(shareFile.fulfilled, (state, action) => {
        state.files = state.files.map((file) => file._id === action.payload._id ? action.payload : file)
      })
  },
})

export const { setFiles, addFile, setSelectedFile, removeFile } = fileSlice.actions
export default fileSlice.reducer
