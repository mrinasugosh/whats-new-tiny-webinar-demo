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
      initialValue='<p dir="ltr">Hey {{Student.FirstName}}!</p><br/><p dir="ltr"> I received your question regarding the homework problem. This is what you need to solve this:</p><br/><p dir="ltr">If you need further clarification, please refer to the lecture notes from last week, or feel free to ask me questions on the steps you are getting stuck at.</p><br/><p dir="ltr">Regards,</p><p dir="ltr">{{Professor.FirstName}}</p>'
    />
  );
}