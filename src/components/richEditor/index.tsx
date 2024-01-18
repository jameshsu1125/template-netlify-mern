import { EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { Ref, forwardRef, useImperativeHandle, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export interface RefObject {
  getHTML: () => string;
}

const RichEditor = forwardRef((_, ref: Ref<RefObject>) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const onEditorStateChange = (e: EditorState) => {
    setEditorState(e);
  };

  useImperativeHandle(ref, () => ({
    getHTML() {
      return stateToHTML(editorState.getCurrentContent());
    },
  }));

  return (
    <Editor
      editorState={editorState}
      toolbarClassName='toolbarClassName'
      wrapperClassName='wrapperClassName'
      editorClassName='editorClassName'
      onEditorStateChange={onEditorStateChange}
    />
  );
});
export default RichEditor;
