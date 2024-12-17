import { create } from "zustand";

interface OnBoardStore {
  installationGuide: string;
  setInstallationGuide: (guide: string) => void;
  projectOverview: string;
  setProjectOverview: (overview: string) => void;
  localPath: string;
  setLocalPath: (path: string) => void;
  onBoardState: "idle" | "inprogress" | "complete" | "error";
  onBoardError: string;
  setOnBoardState: (state: "idle" | "inprogress" | "complete" | "error") => void;
  setOnBoardError: (error: string) => void;
}

export const useOnBoardStore = create<OnBoardStore>((set) => ({
  installationGuide: "",
  projectOverview: "",
  localPath: "",
  onBoardState: "complete",
  onBoardError: "",
  setInstallationGuide: (guide: string) => set({ installationGuide: guide }),
  setProjectOverview: (overview: string) => set({ projectOverview: overview }),
  setLocalPath: (path: string) => set({ localPath: path }),
  setOnBoardState: (state: "idle" | "inprogress" | "complete" | "error") => set({ onBoardState: state }),
  setOnBoardError: (error: string) => set({ onBoardError: error, onBoardState: "error" }),
}));
