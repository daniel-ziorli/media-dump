"use client";
import { chunkFiles, getFilesFromGithubRepo } from "@/components/utils/DocumentUtils";
import { importDocuments } from "@/components/utils/WeaviateUtils";
import { create } from "zustand";

export type RepoTree = {
  name: string;
  type: 'folder' | 'file';
  content?: string;
  children?: RepoTree[];
}

interface RepoStore {
  url: string;
  urlError: string;
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
  urlError: "",
  repoTree: undefined,
  ingestState: "idle",
  logs: [],
  setUrl: (newUrl: string) => {
    set({ urlError: "" });
    set({ url: newUrl });
  },

  setRepoTree: (newTree: RepoTree) => {
    set({ repoTree: newTree });
  },
  ingest: async () => {
    set({ ingestState: "inprogress" });
    const url = get().url;

    if (!validateGitHubUrl(url)) {
      set({ urlError: "Invalid GitHub URL" });
    }
    try {
      const results = await getFilesFromGithubRepo(url, get().addLog);

      console.log(results);

      const documents = await chunkFiles(results, get().addLog);

      console.log(documents);

      get().addLog("Importing documents to Weaviate");
      const import_result = await importDocuments(documents);

      console.log(import_result);
    } catch {
      set({ urlError: "Error ingesting repository" });
      set({ ingestState: "error" });
      return;
    }

    get().addLog("Success! Repository ingested.");
    await new Promise(resolve => setTimeout(resolve, 1000));
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
