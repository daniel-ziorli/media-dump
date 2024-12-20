import { useOnBoardStore } from "@/stores/OnBoardStore";
import { CustomMarkdown } from "@/components/ui/custommarkdown";

export default function ProjectOverview() {
  const { projectOverview } = useOnBoardStore();
  return (
    <CustomMarkdown
      className="h-full overflow-y-scroll p-4 markdown rounded-md"
      content={projectOverview}
    />
  );
}
