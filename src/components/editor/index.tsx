import { EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { memo, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './index.less';

const Edit = memo(() => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const onEditorStateChange = (e: EditorState) => {
    console.log(stateToHTML(e.getCurrentContent()));
    setEditorState(e);
  };
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
export default Edit;
