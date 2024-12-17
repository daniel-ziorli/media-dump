import { useOnBoardStore } from "@/stores/OnBoardStore";

export const FileRef: React.FC<{ filepath: string }> = ({ filepath }) => {
  const { localPath } = useOnBoardStore();
  const filename: string | undefined = filepath.split("/").pop() || undefined;;

  return (
    <a style={{ all: "unset" }} className="" href={`vscode://file/${localPath}/${filename ? filepath : ""}`} target="_blank" rel="noreferrer">
      <span className={`cursor-pointer text-sm font-mono  rounded-lg p-1 px-2 whitespace-nowrap my-1${filename ? ` bg-purple-800` : ` bg-blue-600`}`}>{filepath.split("/").pop() || filepath}</span>
    </a>
  );
};


