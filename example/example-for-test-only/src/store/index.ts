import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {},
  devTools: true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

function wait(number = 1000) {
  return new Promise(res => {
    setTimeout(res, number);
  });
}

export const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId: number, thunkAPI) => {
    // const response = await userAPI.fetchById(userId)
    // return response.data
    await wait(2000);
    // thunkAPI.dispatch();
    return {userName: 'test'};
  }
)
