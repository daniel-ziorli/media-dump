"use client";
import { create } from "zustand";

interface RepoStore {
  url: string;
  urlError: string;
  setUrl: (newUrl: string) => void;
  isIngesting: boolean;
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
  isIngesting: false,
  logs: [],
  setUrl: (newUrl: string) => {
    set({ urlError: "" });
    set({ url: newUrl });
  },

  ingest: () => {
    console.log("ingest");

    set({ isIngesting: true });
    const url = get().url;
    console.log("ingest url", url);

    if (!validateGitHubUrl(url)) {
      set({ urlError: "Invalid GitHub URL" });
    }
    console.log("valid url");

    setTimeout(() => { set({ isIngesting: false }); }, 1000);
  },
  addLog: (message) => {
    const logs = get().logs;
    set({ logs: [...logs, message] });
  },
  clearLogs: () => {
    set({ logs: [] });
  },

}));
