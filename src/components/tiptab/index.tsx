import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './index.less';
import MenuBar from './menu';
import { FaRegSave } from 'react-icons/fa';
import { useEffect } from 'react';

const extensions = [TextStyle, StarterKit];

export default ({ onSave, html }: { onSave: (html: string) => void; html: string }) => {
  const editor = useEditor({
    extensions,
    content: html,
  });

  useEffect(() => {
    if (editor && html !== editor.getHTML()) {
      editor.commands.setContent(html);
    }
  }, [html, editor]);

  return (
    <div className='bg-base-300 p-5'>
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
    </div>
  );
};
