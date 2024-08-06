import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import config from '../../config.json';

export default function TinyEditor() {
  const editorRef = useRef(null);
  return (
    <Editor
      apiKey={config.tinyMCEAPIKey}
      onInit={(_evt, editor) => editorRef.current = editor}
      init={{
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
      }}
      initialValue="Welcome to TinyMCE!"
    />
  );
}