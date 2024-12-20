import { IoOpenOutline } from "react-icons/io5";
import { Button } from "./button";
import VSCodeLink from "./vscodelink";
import { useContextStore } from "@/stores/ContextStore";

export const VSCodeRef: React.FC<{ content: string }> = ({ content }) => {
  if (!content) {
    return null;
  }
  const { setSelectedFile } = useContextStore();

  const match = content.match(/\[(.*?)\]\((.*?)\)$/);
  const path = match?.[1].trim() || "";
  const name = match?.[2] || "";

  if (name === '' && path === '') {
    return (
      <code className="bg-gray-200 p-2 rounded-md text-sm font-mono whitespace-nowrap">
        {content}
      </code>
    );
  }

  const split_path_semicolon = path.split(":");
  const line: number | undefined = split_path_semicolon.length > 1 ? parseInt(split_path_semicolon[1]) : undefined;
  const filename: string | undefined = split_path_semicolon[0].split("/").pop() || undefined;
  const extension: boolean = filename ? filename.split('.').length > 1 : false;

  return (
    <span
      className={`text-sm font-mono whitespace-nowrap cursor-pointer rounded-lg p-1 px-2 my-1 ${line ? "bg-pink-700" : extension ? "bg-purple-800" : "bg-blue-600"}`}
      onClick={() => {
        console.log("setFileLine: " + path + " " + line);
        setSelectedFile(split_path_semicolon[0], line);
      }}
    >
      {name === '' ? path : name}
      <span className="w-8 h-6 -mx-1 inline-block pl-3 transform transition -translate-y-0.5 duration-300 hover:-translate-y-1">
        <VSCodeLink filePath={path} lineNumber={line} >
          <IoOpenOutline className="h-4 w-4 inline-block" />
        </VSCodeLink>
      </span>
    </span>
  );
};


