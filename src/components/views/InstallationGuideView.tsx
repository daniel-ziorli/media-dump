import { useRepoStore } from "@/stores/RepoStore";
import Markdown from "react-markdown";

export function InstallationGuideView() {
  const { installationGuide } = useRepoStore();

  return (
    <Markdown className="markdown rounded-md p-4 h-full overflow-y-scroll">{installationGuide}</Markdown>
  );
}
