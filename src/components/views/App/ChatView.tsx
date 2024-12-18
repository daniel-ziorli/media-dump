import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore } from '@/stores/ChatStore';
import Markdown from 'react-markdown';
import { FileRef } from '@/components/ui/fileref';

export function ChatView() {

  const { messages, addMessage } = useChatStore();
  const [message, setMessage] = React.useState('');

  const handleSendMessage = () => {
    if (!message || message.trim() === '') return;
    addMessage(message);
    setMessage('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)] p-4">
      <div className="flex-1 overflow-y-scroll p-4 flex flex-col-reverse gap-4">
        {messages.toReversed().map((message, index) => {
          if (message.role === "user") {
            return (
              <p className="self-end bg-neutral-800 rounded-2xl px-4 py-2" key={index}>{message.content}</p>
            );
          } else {
            return (
              <Markdown
                key={index}
                className="markdown px-4 py-1 rounded-2xl"
                components={{
                  a: ({ href }) => (
                    <FileRef filepath={href} />
                  ),
                }}
              >
                {message.content}
              </Markdown>
            );
          }
        })}
      </div>
      <div className="flex items-center mt-4 space-x-2">
        <Input type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} />
        <Button onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}
