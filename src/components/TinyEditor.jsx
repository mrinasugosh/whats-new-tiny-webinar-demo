import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyEditor() {
  const editorRef = useRef(null);
  return (
    <Editor
      apiKey='TINY_MCE_API_KEY'
      onInit={(_evt, editor) => editorRef.current = editor}
      init={{
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker importword markdown',
        toolbar: 'importword | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
        importword_service_url: "https://importdocx.converter.tiny.cloud/v2/convert/docx-html",
      }}
    />
  );
}