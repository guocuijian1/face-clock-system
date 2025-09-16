import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImageDataState } from './image-data.state';

export const selectImageDataState = createFeatureSelector<ImageDataState>('imageData');
export const selectImageData = createSelector(
  selectImageDataState,
  (state: ImageDataState) => state.imageData
);

