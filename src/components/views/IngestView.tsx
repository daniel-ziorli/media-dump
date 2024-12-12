"use client";
import { useRepoStore } from "@/stores/RepoStore";

export const IngestView = () => {
  const { logs } = useRepoStore();

  return (
    <div className="w-[800px] h-[60vh] flex flex-col gap-2">
      <code
        className="bg-black rounded-sm p-2 h-full overflow-y-scroll border-2"
        ref={(ref) => {
          if (ref) {
            ref.scrollTop = ref.scrollHeight;
          }
        }}
      >
        {logs.map((log, index) => (
          <p key={index} className="text-[#f8f8f2]">
            {log}
          </p>
        ))}
      </code>
    </div>
  );
};
