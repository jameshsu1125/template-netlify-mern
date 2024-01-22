import { memo, useEffect } from 'react';
import './index.less';
import Editor from '@/components/richEditor';

const EditorPage = memo(() => {
  useEffect(() => {}, []);
  return (
    <div className='EditorPage'>
      <Editor
        defaultHTML=''
        getHTML={(html) => {
          console.log(html);
        }}
      />
    </div>
  );
});
export default EditorPage;
