import { ContentState, EditorState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { Ref, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export interface RefObject {
  getHTML: () => string;
  setHTML: (html: string) => void;
}

type T = {
  defaultHTML?: string;
  onChange: (html: string) => void;
};

const RichEditor = forwardRef(({ defaultHTML, onChange }: T, ref: Ref<RefObject>) => {
  const [editorState, setEditorState] = useState(() => {
    const initialHTML = defaultHTML;
    const blocksFromHTML = convertFromHTML(initialHTML || '');
    const contentState = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );

    return EditorState.createWithContent(contentState);
  });

  const onEditorStateChange = useCallback((editorState: EditorState) => {
    setEditorState(editorState);
    onChange(stateToHTML(editorState.getCurrentContent()));
  }, []);

  useImperativeHandle(ref, () => ({
    getHTML() {
      return stateToHTML(editorState.getCurrentContent());
    },
    setHTML(html: string) {
      setEditorState(() => {
        const blocksFromHTML = convertFromHTML(html);
        const contentState = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap,
        );
        return EditorState.createWithContent(contentState);
      });
    },
  }));

  return (
    <Editor
      editorState={editorState}
      toolbarClassName='toolbarClassName'
      wrapperClassName='wrapperClassName'
      editorClassName='editorClassName'
      onEditorStateChange={onEditorStateChange}
      toolbar={{
        options: [
          'inline',
          'blockType',
          'fontSize',
          'fontFamily',
          'list',
          'textAlign',
          // 'colorPicker',
          'link',
          'embedded',
          'emoji',
          'image',
          'remove',
          'history',
        ],
        inline: { inDropdown: true },
        image: {
          previewImage: true,
        },
      }}
    />
  );
});
export default RichEditor;
