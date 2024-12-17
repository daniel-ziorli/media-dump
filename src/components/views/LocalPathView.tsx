import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useOnBoardStore } from "@/stores/OnBoardStore";

export function LocalPathView() {
  const { localPath, setLocalPath } = useOnBoardStore();

  const handleTest = () => {
    const anchor = document.createElement("a");
    anchor.href = `vscode://file/${localPath}/`;
    anchor.click();
  };

  return (
    <div className="flex items-center justify-center gap-4 p-8 h-full w-full">
      <div className="flex flex-col w-3/5 gap-2">
        <h1 className="text-4xl font-bold">VSCode Integration</h1>
        <p className="text-xl -mt-2 leading-relaxed">By adding your projects local path you can easily open <span className="bg-purple-800 rounded-lg p-1 px-2 whitespace-nowrap">files</span> and <span className="bg-pink-700 rounded-lg p-1 px-2 whitespace-nowrap">code snippets</span> in vscode. This step is <span className="font-bold">optional</span> but recommended.</p>
        <Input
          className="w-full mt-2"
          placeholder="Enter your projects local path..."
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
        />
        <Button onClick={handleTest} variant={"outline"}>Test Integration</Button>
      </div>
    </div>
  );
}
