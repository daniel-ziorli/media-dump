'use client';

import { Button } from '@/components/ui/button';
import VSCodeLink from '@/components/ui/vscodelink';
import { useContextStore } from '@/stores/ContextStore';
import { useEffect, useRef, useState } from 'react';
import { IoOpenOutline } from "react-icons/io5";
import dynamic from "next/dynamic";
import type * as monaco from 'monaco-editor'; // Change this to type import
import { Card } from '@/components/ui/card';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

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
  if (!filePath) return 'plaintext';
  const extension: string = filePath.split('.').pop()?.toLowerCase() ?? '';
  const language: string = fileExtensionToLanguageMap[extension] || 'plaintext';
  return language;
};

export function ContextView() {
  const { fileContext, selectedContext } = useContextStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationCollectionRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof monaco | null>(null);



  useEffect(() => {
    console.log("editorRef.current: " + editorRef.current);
    console.log("fileContext[selectedContext]?.line: " + fileContext[selectedContext]?.line);


    if (!editorRef.current || !monacoInstance || fileContext[selectedContext]?.line === undefined) {
      return;
    }

    if (decorationCollectionRef.current) {
      decorationCollectionRef.current.clear();
    }

    editorRef.current.revealLineInCenter(fileContext[selectedContext].line);
    const range = new monacoInstance.Range(fileContext[selectedContext].line, 1, fileContext[selectedContext].line, 1);
    const decoration = {
      range: range,
      options: {
        isWholeLine: true,
        className: 'highlight-line',
      },
    };
    decorationCollectionRef.current = editorRef.current.createDecorationsCollection([decoration]);
  }, [fileContext, selectedContext]);

  const handleEditorDidMount = (editor: any, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    setMonacoInstance(monaco);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] p-4 overflow-y-hidden">
      <div className='flex-row'>
        {fileContext.map((file, index) => (
          < TabComponent
            key={index}
            name={file.name}
            path={file.path}
            isActive={index === selectedContext}
            onClick={() => useContextStore.setState({ selectedContext: index })}
          />
        ))}
      </div>
      {
        fileContext[selectedContext]?.path ?
          <Editor
            height={'100%'}
            options={{ readOnly: true, minimap: { enabled: false }, wrappingStrategy: 'advanced' }}
            value={fileContext[selectedContext]?.content || ''}
            theme='vs-dark'
            defaultLanguage='javascript'
            language={getFileLanguage(fileContext[selectedContext]?.path || '')}
            onMount={handleEditorDidMount}
          />
          :
          <div className='flex justify-center items-center h-full'>
            <Card className='w-2/3 h-[400px] border-2 bg-neutral-800'>
              <div className='flex justify-center items-center h-full text-2xl font-mono text-center'>
                No Context Available.<br />Please query the chat bot<br />to populate the context
              </div>
            </Card>
          </div>
      }
    </div >
  );
}

interface TabProps {
  name: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const TabComponent: React.FC<TabProps> = ({ name, path, isActive, onClick }) => {
  return (
    <Button
      className={
        'rounded-t-lg rounded-b-none border-b-0 px-2 text-white' +
        (isActive ? ' bg-neutral-800 cursor-default' : '')
      }
      onClick={onClick}
      variant={'outline'}
    >
      <div className='flex items-center h-full gap-1 py-2'>
        <p className='pl-2'>
          {name}

        </p>
        <VSCodeLink filePath={path} lineNumber={undefined} >
          <Button onClick={(e) => { e.stopPropagation() }} variant={'outline'} size={'sm'} className='border-0 p-1 py-2 bg-transparent hover:bg-neutral-600'>
            <IoOpenOutline />
          </Button>
        </VSCodeLink>
      </div>
    </Button>
  );
};

export default TabComponent;
