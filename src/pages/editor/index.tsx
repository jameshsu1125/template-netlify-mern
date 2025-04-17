import Editor from '@/components/richEditor';
import { memo } from 'react';

const EditorPage = memo(() => (
  <div className='w-full'>
    <Editor
      defaultHTML=''
      onSubmit={(html) => {
        console.log(html);
      }}
    />
  </div>
));
export default EditorPage;
