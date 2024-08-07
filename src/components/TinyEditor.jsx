import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import config from '../../config.json';

export default function TinyEditor() {
    const editorRef = useRef(null);

    const revisions = [
      {
          "revisionId": "1",
          "createdAt": "2024-08-07T11:15:00.000Z",
          "content": '<p dir="ltr">Hey {{Student.FirstName}}!</p>\n<p dir="ltr"> I received your question regarding the homework problem. This is what you need to solve this:</p>\n<p dir="ltr">If you need further clarification, please refer to the lecture notes from last week, or feel free to ask me questions on the steps you are getting stuck at.</p>\n<p dir="ltr">Regards,</p><p dir="ltr">{{Professor.FirstName}}</p>'
      },
    ];

    const get_revisions = () => new Promise((resolve) => {
      setTimeout(() => {
        resolve(revisions.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1).reverse());
      }, 1000);
    });


    const fetchApi = import("https://unpkg.com/@microsoft/fetch-event-source@2.0.1/lib/esm/index.js").then(module => module.fetchEventSource);

    const api_key = config.OPENAI_API_KEY;

    const ai_request = (request, respondWith) => {
    respondWith.stream((signal, streamMessage) => {
        // Adds each previous query and response as individual messages
        const conversation = request.thread.flatMap((event) => {
        if (event.response) {
            return [
            { role: 'user', content: event.request.query },
            { role: 'assistant', content: event.response.data }
            ];
        } else {
            return [];
        }
        });

        // System messages provided by the plugin to format the output as HTML content.
        const pluginSystemMessages = request.system.map((content) => ({
        role: 'system',
        content
        }));

        const systemMessages = [
        ...pluginSystemMessages,
        // Additional system messages to control the output of the AI
        { role: 'system', content: 'Remove lines with ``` from the response start and response end.' }
        ]

        // Forms the new query sent to the API
        const content = request.context.length === 0 || conversation.length > 0
        ? request.query
        : `Question: ${request.query} Context: """${request.context}"""`;

        const messages = [
        ...conversation,
        ...systemMessages,
        { role: 'user', content }
        ];

        const requestBody = {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 800,
        messages,
        stream: true
        };

        const openAiOptions = {
        signal,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify(requestBody)
        };

        const onopen = async (response) => {
        if (response) {
            const contentType = response.headers.get('content-type');
            if (response.ok && contentType?.includes('text/event-stream')) {
            return;
            } else if (contentType?.includes('application/json')) {
            const data = await response.json();
            if (data.error) {
                throw new Error(`${data.error.type}: ${data.error.message}`);
            }
            }
        } else {
            throw new Error('Failed to communicate with the ChatGPT API');
        }
        };

        // This function passes each new message into the plugin via the `streamMessage` callback.
        const onmessage = (ev) => {
        const data = ev.data;
        if (data !== '[DONE]') {
            const parsedData = JSON.parse(data);
            const firstChoice = parsedData?.choices[0];
            const message = firstChoice?.delta?.content;
            if (message) {
            streamMessage(message);
            }
        }
        };

        const onerror = (error) => {
        // Stop operation and do not retry by the fetch-event-source
        throw error;
        };

        // Use microsoft's fetch-event-source library to work around the 2000 character limit
        // of the browser `EventSource` API, which requires query strings
        return fetchApi
        .then(fetchEventSource =>
        fetchEventSource('https://api.openai.com/v1/chat/completions', {
            ...openAiOptions,
            openWhenHidden: true,
            onopen,
            onmessage,
            onerror
        })
        )
        .then(async (response) => {
        if (response && !response.ok) {
            const data = await response.json();
            if (data.error) {
            throw new Error(`${data.error.type}: ${data.error.message}`);
            }
        }
        })
        .catch(onerror);
    });
    };
    return (
        <Editor
        apiKey={config.tinyMCEAPIKey}
        onInit={(_evt, editor) => editorRef.current = editor}
        init={{
            plugins: 'ai revisionhistory anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker importword markdown math exportpdf',
            toolbar: 'aidialog aishortcuts | importword exportpdf | math | undo redo revisionhistory | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
            importword_service_url: "https://importdocx.converter.tiny.cloud/v2/convert/docx-html",
            exportpdf_service_url: "https://exportpdf.converter.tiny.cloud/v1/convert",
            ai_request,
            revisionhistory_fetch: get_revisions,
        }}
        initialValue='<p dir="ltr">Hey {{Student.FirstName}}!</p><br/><p dir="ltr"> I received your question regarding the homework problem. This is what you need to solve this:</p><br/><p dir="ltr">If you need further clarification, please refer to the lecture notes from last week, or feel free to ask me questions on the steps you are getting stuck at.</p><br/><p dir="ltr">Regards,</p><p dir="ltr">{{Professor.FirstName}}</p>'
        />
    );
}