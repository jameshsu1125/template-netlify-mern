import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { useEditorState, type Editor } from '@tiptap/react';
import { memo, useCallback, useContext, useEffect, useRef } from 'react';
import { AiOutlineEnter } from 'react-icons/ai';
import { BiCodeBlock } from 'react-icons/bi';
import { BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4 } from 'react-icons/bs';
import { FaBold, FaCode, FaImage, FaItalic, FaParagraph, FaStrikethrough } from 'react-icons/fa6';
import { GoHorizontalRule, GoListOrdered } from 'react-icons/go';
import { GrBlockQuote } from 'react-icons/gr';
import { LuRedo2, LuUndo2 } from 'react-icons/lu';
import { MdFormatListBulleted } from 'react-icons/md';
import { TbClearFormatting } from 'react-icons/tb';
import { VscClearAll } from 'react-icons/vsc';
import { twMerge } from 'tailwind-merge';
import Album from '../album';
import './index.less';

const ModalTitle = 'Album';

const MenuBar = memo(({ editor }: { editor: Editor }) => {
  const [context, setContext] = useContext(Context);
  const { copiedText } = context[ActionType.Album];
  const { enabled, title, onClose } = context[ActionType.Modal];
  const copiedTextRef = useRef(copiedText);

  useEffect(() => {
    copiedTextRef.current = copiedText;
  }, [copiedText]);

  useEffect(() => {
    if (ModalTitle === title && !enabled) {
      onClose?.();
    }
  }, [enabled, title, onClose]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  const addImage = useCallback(() => {
    setContext({
      type: ActionType.Modal,
      state: {
        enabled: true,
        title: ModalTitle,
        body: <Album />,
        onClose: () => {
          if (!copiedTextRef.current) return;
          editor.chain().focus().setImage({ src: copiedTextRef.current }).run();
        },
      },
    });
  }, [editor, setContext]);

  return (
    <div className='join btn-sm flex-wrap'>
      <div className='tooltip' data-tip='粗體'>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={twMerge('btn btn-soft', editorState.isBold ? 'is-active' : '')}
        >
          <FaBold />
        </button>
      </div>
      <div className='tooltip' data-tip='斜體'>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={twMerge('btn', editorState.isItalic ? 'is-active' : '')}
        >
          <FaItalic />
        </button>
      </div>
      <div className='tooltip' data-tip='刪除線'>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={twMerge('btn', editorState.isStrike ? 'is-active' : '')}
        >
          <FaStrikethrough />
        </button>
      </div>
      <div className='tooltip' data-tip='程式碼'>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={twMerge('btn', editorState.isCode ? 'is-active' : '')}
        >
          <FaCode />
        </button>
      </div>
      <div className='tooltip' data-tip='清除標記'>
        <button className='btn' onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          <TbClearFormatting />
        </button>
      </div>
      <div className='tooltip' data-tip='清除節點'>
        <button className='btn' onClick={() => editor.chain().focus().clearNodes().run()}>
          <VscClearAll />
        </button>
      </div>
      <div className='tooltip' data-tip='段落'>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={twMerge('btn', editorState.isParagraph ? 'is-active' : '')}
        >
          <FaParagraph />
        </button>
      </div>
      <div className='tooltip' data-tip='標題 1'>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={twMerge('btn', editorState.isHeading1 ? 'is-active' : '')}
        >
          <BsTypeH1 />
        </button>
      </div>
      <div className='tooltip' data-tip='標題 2'>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={twMerge('btn', editorState.isHeading2 ? 'is-active' : '')}
        >
          <BsTypeH2 />
        </button>
      </div>
      <div className='tooltip' data-tip='標題 3'>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={twMerge('btn', editorState.isHeading3 ? 'is-active' : '')}
        >
          <BsTypeH3 />
        </button>
      </div>
      <div className='tooltip' data-tip='標題 4'>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={twMerge('btn', editorState.isHeading4 ? 'is-active' : '')}
        >
          <BsTypeH4 />
        </button>
      </div>
      <div className='tooltip' data-tip='項目清單'>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={twMerge('btn', editorState.isBulletList ? 'is-active' : '')}
        >
          <MdFormatListBulleted />
        </button>
      </div>
      <div className='tooltip' data-tip='有序清單'>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={twMerge('btn', editorState.isOrderedList ? 'is-active' : '')}
        >
          <GoListOrdered />
        </button>
      </div>
      <div className='tooltip' data-tip='程式區塊'>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={twMerge('btn', editorState.isCodeBlock ? 'is-active' : '')}
        >
          <BiCodeBlock />
        </button>
      </div>
      <div className='tooltip' data-tip='引用區塊'>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={twMerge('btn', editorState.isBlockquote ? 'is-active' : '')}
        >
          <GrBlockQuote />
        </button>
      </div>
      <div className='tooltip' data-tip='水平線'>
        <button className='btn' onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <GoHorizontalRule />
        </button>
      </div>
      <div className='tooltip' data-tip='換行'>
        <button className='btn' onClick={() => editor.chain().focus().setHardBreak().run()}>
          <AiOutlineEnter />
        </button>
      </div>
      <div className='tooltip' data-tip='新增圖片'>
        <button className='btn' onClick={addImage}>
          <FaImage />
        </button>
      </div>
      <div className='tooltip' data-tip='復原'>
        <button
          className='btn'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
        >
          <LuUndo2 />
        </button>
      </div>
      <div className='tooltip' data-tip='重做'>
        <button
          className='btn'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
        >
          <LuRedo2 />
        </button>
      </div>
    </div>
  );
});
export default MenuBar;
