"use client";
import { chunkFiles, getFilesFromGithubRepo } from "@/components/utils/DocumentUtils";
import { createInstallationGuide, createOverview } from "@/components/utils/LLMUtils";
import { importDocuments } from "@/components/utils/WeaviateUtils";
import { create } from "zustand";
import { useOnBoardStore } from "./OnBoardStore";

export type RepoTree = {
  name: string;
  path: string;
  type: 'folder' | 'file';
  line?: number;
  content?: string;
  children?: RepoTree[];
}

export interface IChunk {
  file_name: string;
  file_path: string;
  content: string;
  tags: string[];
  start_line: number;
  end_line: number;
}

interface RepoStore {
  url: string;
  setUrl: (newUrl: string) => void;
  repoTree?: RepoTree;
  setRepoTree: (newTree: RepoTree) => void;
  ingestState: "idle" | "inprogress" | "success" | "error";
  ingest: () => void;
  logs: string[];
  addLog: (message: string) => void;
  clearLogs: () => void;
}

const validateGitHubUrl = (url: string): boolean => {
  const regex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
  return regex.test(url);
};

export const useRepoStore = create<RepoStore>((set, get) => ({
  url: "",
  repoTree: undefined,
  ingestState: "idle",
  installationGuide: "",
  logs: [],
  setUrl: (newUrl: string) => {
    set({ url: newUrl });
  },

  setRepoTree: (newTree: RepoTree) => {
    set({ repoTree: newTree });
  },

  ingest: async () => {
    set({ ingestState: "inprogress" });
    const url = get().url;

    if (!validateGitHubUrl(url)) {
      set({ ingestState: "idle" });
      useOnBoardStore.getState().setOnBoardError("Invalid GitHub URL");
      return;
    }
    try {
      // please don't judge this is temporary cant be running up those openai bills
      const download_files = true;
      const generate_embeddings = false;
      const generate_installation_guide = true;
      const generate_project_overview = true;

      let tree: RepoTree | undefined = undefined;
      if (generate_embeddings || generate_installation_guide || generate_project_overview || download_files) {
        tree = await getFilesFromGithubRepo(url, get().addLog);
        set({ repoTree: tree });
      }

      if (generate_embeddings && tree) {
        const documents = await chunkFiles(tree, get().addLog);
        get().addLog("Importing documents to Weaviate");
        const import_result = await importDocuments(documents);
        console.log(import_result);
        get().addLog("Successfully imported documents to Weaviate");
      }

      if (generate_installation_guide && tree) {
        get().addLog("Generating installation guide");
        const installation_guide = await createInstallationGuide(tree, url);
        if (!installation_guide) {
          set({ ingestState: "error" });
          return;
        }
        useOnBoardStore.getState().installationGuide = installation_guide;
        get().addLog("Successfully generated installation guide");

      } else {
        useOnBoardStore.getState().setInstallationGuide("This is a test installation guide.");
      }

      if (generate_project_overview && tree) {
        get().addLog("Generating project overview");
        const project_overview = await createOverview(tree);
        if (!project_overview) {
          return;
        }
        useOnBoardStore.getState().setProjectOverview(project_overview);
        get().addLog("Successfully generated project overview");
      } else {
        useOnBoardStore.getState().setProjectOverview("This is a test project overview [readme.md/3](readme.md/3) `[readme.md:3] Readme line 3` `[readme.md] Readme` `[src/components]src/components`. ");
      }
    } catch {
      return;
    }

    get().addLog("Success! Repository ingested.");
    set({ ingestState: "success" });
  },
  addLog: (message) => {
    const logs = get().logs;
    set({ logs: [...logs, message] });
  },
  clearLogs: () => {
    set({ logs: [] });
  },

}));
