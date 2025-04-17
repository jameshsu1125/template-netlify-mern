import { CAPTURE_PROPERTY, REST_PATH } from '@/settings/config';
import { ContentState, EditorState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Fetcher from 'lesca-fetcher';
import { FileToBase64 } from 'lesca-react-capture-button';
import { Ref, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { TUploadRespond } from '../../../../setting/type';

export interface RefObject {
  getHTML: () => string;
  setHTML: (html: string) => void;
}

type T = {
  defaultHTML?: string;
  onChange: (html: string) => void;
};

const RichEditor = forwardRef(({ defaultHTML, onChange }: T, ref: Ref<RefObject>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const uploadCallback = (file: File) => {
    return new Promise((resolve, reject) => {
      if (canvasRef.current) {
        FileToBase64({
          file,
          canvas: canvasRef.current,
          maxWidth: CAPTURE_PROPERTY.maxWidth,
          compress: CAPTURE_PROPERTY.compress,
        }).then((e) => {
          Fetcher.post(REST_PATH.upload, { image: e.image, folder: 'editor' }).then((respond) => {
            const res = respond as { res: boolean; data: TUploadRespond };
            if (res.res) {
              const data = res.data as TUploadRespond;
              resolve({ data: { link: data.secure_url } });
            } else reject('上傳失敗');
          });
        });
      }
    });
  };

  return (
    <>
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
            // 'textAlign',
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
            urlEnabled: true,
            previewImage: true,
            uploadEnabled: true,
            uploadCallback,
          },
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
});
export default RichEditor;
