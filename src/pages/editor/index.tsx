import Editor from '@/components/richEditor';
import { memo } from 'react';
import './index.less';

const EditorPage = memo(() => (
  <div className='EditorPage'>
    <Editor
      defaultHTML=''
      onSubmit={(html) => {
        console.log(html);
      }}
    />
  </div>
));
export default EditorPage;
