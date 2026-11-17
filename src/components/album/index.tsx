import { memo, useState } from 'react';
import { FaFolderTree } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import Breadcrumb from './breadcrumb';
import { AlbumContext, AlbumState, TAlbumMode } from './config';
import AlbumConfirm from './confirm';
import Detail from './detail';
import Grid from './grid';
import Tree from './tree';
import { DropZone, NewFolderButton, UploadButton, UploadQueue } from './uploader';

type T = {
  /** picker: used inside the editor modal, the detail panel inserts the image */
  mode?: TAlbumMode;
};

const Album = memo(({ mode = 'manage' }: T) => {
  const value = useState({ ...AlbumState, mode });
  const picker = mode === 'picker';

  return (
    <AlbumContext.Provider value={value}>
      <div className={twMerge('flex w-full flex-col gap-3', picker ? '' : 'p-5')}>
        <div className='flex flex-wrap items-center gap-2'>
          {/* narrow screens and the modal fold the tree into a dropdown */}
          <div className={twMerge('dropdown', picker ? '' : 'lg:hidden')}>
            <button type='button' tabIndex={0} className='btn btn-sm'>
              <FaFolderTree />
              資料夾
            </button>
            <div
              tabIndex={0}
              className='dropdown-content rounded-box bg-base-100 z-30 max-h-80 w-64 overflow-y-auto p-2 shadow'
            >
              <Tree />
            </div>
          </div>
          <Breadcrumb />
          <NewFolderButton />
          <UploadButton />
        </div>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-start'>
          {!picker && (
            <nav className='bg-base-200 rounded-box hidden w-56 shrink-0 lg:block'>
              <Tree />
            </nav>
          )}
          <DropZone>
            <Grid />
          </DropZone>
          <Detail />
        </div>
      </div>
      <AlbumConfirm />
      <UploadQueue />
    </AlbumContext.Provider>
  );
});
export default Album;
