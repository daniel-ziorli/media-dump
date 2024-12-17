import { useOnBoardStore } from "@/stores/OnBoardStore";
import { parseReferences } from "../utils/ResponseUtils";
import { FileRef } from "../ui/fileref";
import Markdown from "react-markdown";

export default function ProjectOverview() {
    const { projectOverview } = useOnBoardStore();
    return (
        <Markdown
            className="h-full overflow-y-scroll p-4 markdown rounded-md"
            components={{
                a: ({ href }) => (
                    <FileRef filepath={href} />
                ),
            }}
        >
            {projectOverview}
        </Markdown>
    );
}
