import { createAction, props } from '@ngrx/store';

export const setImageData = createAction('[ImageData] Set', props<{ imageData: string }>());
export const clearImageData = createAction('[ImageData] Clear');
