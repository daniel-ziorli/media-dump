'use client';

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore } from '@/stores/ChatStore';
import { CustomMarkdown } from '@/components/ui/custommarkdown';

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
        {messages && messages.toReversed().map((message, index) => {
          if (message.role === "user") {
            return (
              <p className="self-end bg-neutral-800 rounded-2xl px-4 py-2" key={index}>{message.content}</p>
            );
          } else {
            return (
              <CustomMarkdown
                key={index}
                className="markdown px-4 py-1 rounded-2xl"
                content={message.content}
              />
            );
          }
        })}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["Explain the structure of the repo", "How does the modal work?", "Where does the app start?"].map((text, index) => (
          <div
            key={index}
            className="bg-neutral-900 p-4 rounded-lg cursor-pointer"
            onClick={() => {
              addMessage(text);
            }}
          >
            {text}
          </div>
        ))}
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
