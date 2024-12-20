import Markdown from "react-markdown";
import { VSCodeRef } from "./vscoderef";

export const CustomMarkdown = ({ content, className }: { content: string; className?: string }) => {
  console.log("markdown: " + content);

  return (
    <Markdown
      key={content}
      className={`markdown px-4 py-1 rounded-2xl ${className}`}
      components={{
        code: ({ children }) => <VSCodeRef content={children as string} />,
      }}
    >
      {content}
    </Markdown>
  );
};
