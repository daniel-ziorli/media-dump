import { Card } from '@/components/ui/card';
import { FileRef } from '@/components/ui/fileref';
import { useContextStore } from '@/stores/ContextStore';
import Editor from '@monaco-editor/react';


const fileExtensionToLanguageMap: { [key: string]: string } = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  html: 'html',
  css: 'css',
  json: 'json',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  txt: 'plaintext',
};
const getFileLanguage = (filePath: string): string => {
  console.log('getFileLanguage');
  if (!filePath) return 'plaintext';
  const extension: string = filePath.split('.').pop()?.toLowerCase() ?? '';
  console.log(extension);
  const language: string = fileExtensionToLanguageMap[extension] || 'plaintext';
  console.log('picked language: ' + language);
  return language;
};

export function ContextView() {
  const { fileContext } = useContextStore();
  console.log("fileContext: " + fileContext);


  return (
    <div className="flex flex-col h-[calc(100vh-32px)] p-4">
      <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-4">
        {fileContext.map((item, index) => {
          if (!item || !item.content) return null;
          return (
            <Card key={index} className='p-4 flex flex-col gap-4'>
              <FileRef filepath={item.path} />
              <Editor
                className='rounded-xl'
                height={Math.min((item.content.split('\n').length + 1) * 24, 400).toString() + "px"}
                options={{ readOnly: true, minimap: { enabled: false }, wrappingStrategy: 'advanced' }}
                value={item.content}
                theme='vs-dark'
                defaultLanguage={getFileLanguage(item.path)}
              />
            </Card>
          )
        })}
      </div>
    </div>
  );
}
