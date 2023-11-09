import { createContext, Dispatch, SetStateAction } from 'react';

export type TCollectionState = { page: string };
export type TCollectionContext = [TCollectionState, Dispatch<SetStateAction<TCollectionState>>];

export const CollectionState = { page: '' };
export const CollectionContext = createContext<TCollectionContext>([CollectionState, () => {}]);
