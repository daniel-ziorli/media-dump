"use client";
import { chunkFiles, getFilesFromGithubRepo } from "@/components/utils/DocumentUtils";
import { createInstallationGuide } from "@/components/utils/LLMUtils";
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
  installationGuide: string;
  setInstallationGuide: (newGuide: string) => void;
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
  installationGuide: "",
  logs: [],
  setUrl: (newUrl: string) => {
    set({ urlError: "" });
    set({ url: newUrl });
  },

  setRepoTree: (newTree: RepoTree) => {
    set({ repoTree: newTree });
  },

  setInstallationGuide: (newGuide: string) => {
    set({ installationGuide: newGuide });
  },

  ingest: async () => {
    set({ ingestState: "inprogress" });
    const url = get().url;

    if (!validateGitHubUrl(url)) {
      set({ urlError: "Invalid GitHub URL" });
    }
    try {
      const use_gen_ai = false;
      const tree = await getFilesFromGithubRepo(url, get().addLog);

      if (use_gen_ai) {
        const documents = await chunkFiles(tree, get().addLog);
        get().addLog("Importing documents to Weaviate");
        const import_result = await importDocuments(documents);
        console.log(import_result);
        get().addLog("Successfully imported documents to Weaviate");
      }

      get().addLog("Generating installation guide");
      const installation_guide = await createInstallationGuide(tree, url);
      if (!installation_guide) {
        set({ urlError: "Error generating installation guide" });
        set({ ingestState: "error" });
        return;
      }
      get().setInstallationGuide(installation_guide);
      get().addLog("Successfully generated installation guide");
    } catch {
      set({ urlError: "Error ingesting repository" });
      set({ ingestState: "error" });
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
