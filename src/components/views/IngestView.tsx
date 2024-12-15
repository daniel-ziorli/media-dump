"use client";
import { useRepoStore } from "@/stores/RepoStore";
import { useEffect, useRef } from "react";

export const IngestView = () => {
  const { logs } = useRepoStore();
  const lastItem = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!lastItem.current) return;
    lastItem.current.scrollIntoView({ behavior: "smooth" });

  }, [logs]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full overflow-y-scroll px-4 py-2 font-mono" ref={lastItem}>
      {logs.map((log, index) => (
        <p key={index} className="text-neutral-400" ref={index === logs.length - 1 ? lastItem : null}>
          {log}
        </p>
      ))}
    </div>

  );
};
