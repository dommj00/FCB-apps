import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClipsState, Clip } from '../types';

const initialState: ClipsState = {
  items: [],
  selectedClips: [],
  loading: false,
  error: null,
};

const clipsSlice = createSlice({
  name: 'clips',
  initialState,
  reducers: {
    setClips: (state, action: PayloadAction<Clip[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    toggleClipSelection: (state, action: PayloadAction<string>) => {
      const clipId = action.payload;
      const index = state.selectedClips.indexOf(clipId);
      if (index > -1) {
        state.selectedClips.splice(index, 1);
      } else {
        state.selectedClips.push(clipId);
      }
    },
    clearSelection: state => {
      state.selectedClips = [];
    },
  },
});

export const { setClips, setLoading, setError, toggleClipSelection, clearSelection } = clipsSlice.actions;
export default clipsSlice.reducer;
