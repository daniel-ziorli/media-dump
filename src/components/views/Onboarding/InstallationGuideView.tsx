import { CustomMarkdown } from "@/components/ui/custommarkdown";
import { useOnBoardStore } from "@/stores/OnBoardStore";

export function InstallationGuideView() {
  const { installationGuide } = useOnBoardStore();

  return (
    <CustomMarkdown className="markdown rounded-md p-4 h-full overflow-y-scroll" content={installationGuide} />
  );
}
