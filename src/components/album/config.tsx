import { createContext, Dispatch, SetStateAction } from 'react';

export type TAlbumState = { enabled: boolean; body: string; public_id: string[]; submit: boolean };
export type TAlbumContext = [TAlbumState, Dispatch<SetStateAction<TAlbumState>>];

export const AlbumState: TAlbumState = {
  enabled: false,
  body: 'delete this photo?',
  public_id: [],
  submit: false,
};
export const AlbumContext = createContext<TAlbumContext>([AlbumState, () => {}]);
