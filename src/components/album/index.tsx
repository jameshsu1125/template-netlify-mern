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
        <div className='navbar bg-base-200 rounded-box min-h-0 gap-2 px-3 py-2'>
          <div className='navbar-start w-auto min-w-0 flex-1 gap-2'>
            {/* narrow screens and the modal fold the tree into a dropdown */}
            <details className={twMerge('dropdown', picker ? '' : 'lg:hidden')}>
              <summary className='btn btn-sm btn-ghost btn-square' aria-label='資料夾'>
                <FaFolderTree />
              </summary>
              <div className='dropdown-content bg-base-100 rounded-box z-30 max-h-80 w-64 overflow-y-auto shadow-sm'>
                <Tree />
              </div>
            </details>
            <Breadcrumb />
          </div>
          <div className='navbar-end w-auto gap-2'>
            <NewFolderButton />
            <UploadButton />
          </div>
        </div>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-start'>
          {!picker && (
            <nav className='bg-base-200 rounded-box hidden w-60 shrink-0 lg:sticky lg:top-0 lg:block'>
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
