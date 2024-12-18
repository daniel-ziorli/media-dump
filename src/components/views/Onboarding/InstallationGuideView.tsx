import { useOnBoardStore } from "@/stores/OnBoardStore";
import Markdown from "react-markdown";

export function InstallationGuideView() {
  const { installationGuide } = useOnBoardStore();

  return (
    <Markdown className="markdown rounded-md p-4 h-full overflow-y-scroll">{installationGuide}</Markdown>
  );
}
