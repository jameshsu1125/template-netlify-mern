import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './index.less';
import MenuBar from './menu';
import { FaRegSave } from 'react-icons/fa';

const extensions = [TextStyle, StarterKit];

export default ({ onSave }: { onSave: (html: string) => void }) => {
  const editor = useEditor({
    extensions,
    content: ``,
  });

  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex flex-col'>
        <MenuBar editor={editor} />
      </div>
      <div className='bg-base-200 p-5'>
        <EditorContent editor={editor} className='bg-base-100 rounded-lg [&_div]:min-h-44' />
      </div>
      <div className='flex w-full justify-end'>
        <button className='btn' onClick={() => onSave(editor?.getHTML() || '')}>
          <FaRegSave /> 儲存
        </button>
      </div>
    </div>
  );
};
