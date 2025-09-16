import { createReducer, on } from '@ngrx/store';
import { setImageData, clearImageData } from './image-data.actions';
import { ImageDataState } from './image-data.state';

export const initialState: ImageDataState = {
  imageData: ''
};

export const imageDataReducer = createReducer(
  initialState,
  on(setImageData, (state, { imageData }) => ({ ...state, imageData })),
  on(clearImageData, state => ({ ...state, imageData: '' }))
);

