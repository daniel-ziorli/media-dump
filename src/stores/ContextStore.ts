import { hybridSearch } from "@/components/utils/WeaviateUtils";
import { WeaviateObject } from "weaviate-client";
import { create } from "zustand";
import { RepoTree, useRepoStore } from "./RepoStore";
import { getFilesByPath } from "@/components/utils/TreeUtils";

interface ContextStore {
  contextState: string;
  context: WeaviateObject<undefined>[];
  fileContext: RepoTree[];
  getContext: (query: string) => Promise<WeaviateObject<undefined>[]>;

}

export const useContextStore = create<ContextStore>((set, get) => ({
  contextState: "",
  context: [],
  fileContext: [
    {
      name: "Settings.jsx",
      path: "src/Settings.jsx",
      type: "file",
      content: "import React from 'react';\n\nconst Settings = () => {\n  return (\n    <div>\n      Settings\n    </div>\n  );\n};\n\nexport default Settings;",
    }
  ],

  getContext: async (query: string) => {
    set({ contextState: "Fetching context from Weaviate..." });
    const query_results = await hybridSearch(query);
    set({ context: query_results.objects, contextState: "" });

    // unique set of file paths filtering out non strings sorry god
    const file_paths = [...new Set(query_results.objects.map((item) => item.properties?.file_path).filter((item) => typeof item === 'string'))];
    const { repoTree } = useRepoStore.getState();
    for (const file_path of file_paths) {
      const files = getFilesByPath(repoTree, file_path)[0];
      set({ fileContext: [...get().fileContext, files] });
    }
    return query_results.objects;
  },
}));