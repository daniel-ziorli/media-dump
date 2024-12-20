import React from 'react';
import { useOnBoardStore } from '@/stores/OnBoardStore';

interface VSCodeLinkProps {
  filePath: string;
  lineNumber?: number;
  className?: string;
  children: React.ReactNode;
}

const VSCodeLink: React.FC<VSCodeLinkProps> = ({ filePath, className, children }) => {
  const { localPath } = useOnBoardStore();
  return (
    <a style={{ all: "unset" }} className={className ? className : "cursor-pointer"} href={`vscode://file/${localPath}/${filePath}`} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

export default VSCodeLink;
