import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { UsersState } from '../../app/types';
import { fetchUsersApi, registerUserApi, usersOnPage } from './usersAPI';

const initialState: UsersState = {
  users: [],
  status: 'idle',
  next_url: null,
  currentUser: null
};

export const fetchUsersAsync = createAsyncThunk(
  'users/fetchUsersAsync',
  async () => {
    const response = await fetchUsersApi();
    return response;
  }
);

export const addUsersAsync = createAsyncThunk(
  'users/addUsersAsync',
  async (next_url: string | null) => {
    const response = await fetchUsersApi(next_url);
    return response;
  }
);

export const registerUserAsync = createAsyncThunk(
  'users/registerUserAsync',
  async (data: any, { rejectWithValue }) => {

    const response = await registerUserApi(data);

    if (!response.status.success) {
      return rejectWithValue(response);
    }

    return response;
  }

);

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        const { users, next_url } = action.payload;
        state.users = users;
        state.status = 'idle';
        state.next_url = next_url;
       })
      .addCase(fetchUsersAsync.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addUsersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addUsersAsync.fulfilled, (state, action) => {
        const { users, next_url } = action.payload;
        state.status = 'idle';
        state.next_url = next_url;
        state.users = state.users.concat(users);
      }).addCase(addUsersAsync.rejected, (state) => {
        state.status = 'failed';
      })

      .addCase(registerUserAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        const { user } = action.payload;
        state.status = 'idle';
        if (user) {
          if (state.users && state.users.length > 0) {
            state.users.pop();
          }
          state.users.unshift(user);

          if (state.users && state.users.length > usersOnPage) {
            state.users = state.users.slice(0, usersOnPage - 1);
          }
        }
      }).addCase(registerUserAsync.rejected, (state) => {
        state.status = 'failed';
      });

  },
});

export const selectUsers = (state: RootState) => state.user.users;

export const selectNextUrl = (state: RootState) => state.user.next_url;

export default usersSlice.reducer;
