import { Card } from '@/components/ui/card';
import React from 'react';
import { ChatView } from './ChatView';
import { ContextView } from './ContextView';

export function AppView() {
  return (
    <div className="p-4 h-[100vh] w-[100vw] grid grid-cols-2 gap-4">
      <Card className="col-span-1 row-span-1">
        <ChatView />
      </Card>
      <Card className="col-span-1 row-span-1">
        <ContextView />
      </Card>
    </div>
  );
}
