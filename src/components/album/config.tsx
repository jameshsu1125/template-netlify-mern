import { createContext, Dispatch, SetStateAction } from 'react';
import { TUploadRespond } from '../../../setting/type';

/** manage: album page; picker: inside the editor modal, the main action inserts the image */
export type TAlbumMode = 'manage' | 'picker';

export type TQueueItem = {
  id: string;
  name: string;
  base64: string;
  folder: string;
  status: 'waiting' | 'uploading' | 'done' | 'error';
  msg?: string;
};

export type TConfirm = { title: string; body: string; public_id: string[] } | null;

export type TAlbumState = {
  mode: TAlbumMode;
  /** delete keys of the checked images */
  selected: string[];
  /** image shown in the detail panel */
  detail: TUploadRespond | null;
  /** folder path ('*' for root) → names of its sub folders */
  tree: Record<string, string[]>;
  expanded: string[];
  queue: TQueueItem[];
  confirm: TConfirm;
  /** +1 refetches the current folder */
  reload: number;
};
export type TAlbumContext = [TAlbumState, Dispatch<SetStateAction<TAlbumState>>];

export const AlbumState: TAlbumState = {
  mode: 'manage',
  selected: [],
  detail: null,
  tree: {},
  expanded: [],
  queue: [],
  confirm: null,
  reload: 0,
};
export const AlbumContext = createContext<TAlbumContext>([AlbumState, () => {}]);

export const joinPath = (parent: string, name: string) =>
  parent === '*' || parent === '' ? name : `${parent}/${name}`;

export const parentPath = (path: string) => {
  const index = path.lastIndexOf('/');
  return index === -1 ? '*' : path.slice(0, index);
};

/** the value the remove api expects for an image */
export const removeKey = (item: TUploadRespond) =>
  item.pixels === 0 ? item.secure_url : item.public_id;

/** drop the cached children of a folder so the tree asks again */
export const dropTree = (tree: Record<string, string[]>, path: string) => {
  const next = { ...tree };
  delete next[path];
  return next;
};

/** names of the folder entries in a search result */
export const folderNames = (data?: TUploadRespond[]) =>
  (data || []).filter((item) => item.resource_type === 'folder').map((item) => item.filename);
