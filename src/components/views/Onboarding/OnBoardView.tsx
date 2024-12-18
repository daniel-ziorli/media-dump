import { motion } from "framer-motion";
import { useState } from "react";
import { useRepoStore } from "@/stores/RepoStore";
import { IngestView } from "./IngestView";
import { Button } from "../../ui/button";
import { InstallationGuideView } from "./InstallationGuideView";
import { LocalPathView } from "./LocalPathView";
import ProjectOverview from "./ProjectOverView";
import { useOnBoardStore } from "@/stores/OnBoardStore";

export function OnBoardView() {

  const { ingestState } = useRepoStore();
  const { setOnBoardState } = useOnBoardStore();
  const [isLocallyInstalled, setIsLocallyInstalled] = useState(false);
  const [isVSCodeIntegrated, setIsVSCodeIntegrated] = useState(false);

  const [step, setStep] = useState(0);


  const steps = [
    { title: "Ingest Repo", done: ingestState === "success" },
    { title: "Install Locally", done: isLocallyInstalled, nocheck: true },
    { title: "VSCode Integration", done: isVSCodeIntegrated, nocheck: true },
    { title: "Project Overview", done: false, nocheck: true },
  ];

  return (
    <div className="flex w-[80vw] h-[80vh]">
      <div className="w-1/4 h-full rounded-l-lg border-2 p-8">
        <div className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <ChecklistItem
              key={index}
              title={step.title}
              done={step.done || false}
              onClick={() => {
                if (steps[index].done) {
                  setStep(index);
                }
              }}
            />
          ))}
        </div>
      </div>
      <div className="w-3/4 h-full rounded-r-lg border-2 border-l-0 flex flex-col gap-4 p-4 overflow-hidden">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: "linear" }}
          className="w-full h-full overflow-auto"
        >
          {step === 0 && <IngestView />}
          {step === 1 && <InstallationGuideView />}
          {step === 2 && <LocalPathView />}
          {step === 3 && <ProjectOverview />}
        </motion.div>
        <div className="flex gap-4">
          <Button
            className="flex-1"
            variant={"outline"}
            disabled={step === 0}
            onClick={() => setStep((step) => step - 1)}
          >
            Previous
          </Button>
          <Button
            className="flex-1 bg-gradient-to-br from-pink-600 to-purple-600 text-white"
            disabled={!steps[step].done && !steps[step].nocheck}
            onClick={() => {
              setStep((step) => step + 1)
              if (step >= 1) setIsLocallyInstalled(true)
              if (step >= 2) setIsVSCodeIntegrated(true)
              if (step === steps.length - 1) {
                setOnBoardState("complete");
              }
            }}
          >
            {step === steps.length - 1 ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ title, done, onClick }: { title: string, done: boolean, onClick?: () => void }) {
  return (
    <div className={"flex items-center gap-2 font-mono bg-neutral-900 p-2 rounded-lg " + (done ? "cursor-pointer hover:bg-neutral-800" : "cursor-default")} onClick={onClick}>
      <motion.div
        className="relative flex items-center justify-center w-6 h-6 border-2 border-neutral-500 rounded-full"
        animate={{
          borderColor: done ? "#22c55e" : "#737373", // Green when done, gray otherwise
        }}
        transition={{ duration: 0.3 }}
      >
        {done && (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 26 23"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-green-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          >
            <path d="M5 12l5 5L20 7" />
          </motion.svg>
        )}
      </motion.div>
      <motion.div
        className="relative inline-block"
        initial="initial"
        animate={done ? "done" : "initial"}
      >
        <motion.p
          className={`text-md ${done ? "text-neutral-500" : "text-white"}`}
          initial={{ color: "#ffffff" }}
          animate={{ color: done ? "#737373" : "#ffffff" }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.p>

        <motion.span
          className="absolute left-0 top-1/2 h-[1px] w-full bg-neutral-500 origin-left"
          style={{
            transform: "translateY(-50%)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: done ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
}
