"use client";

import { HomeView } from "@/components/views/HomeView";
import { IngestView } from "@/components/views/IngestView";
import { motion } from "framer-motion"
import { useRepoStore } from "@/stores/RepoStore";
import { Card } from "@/components/ui/card";
import { SearchView } from "@/components/views/SearchView";
import { OnBoardView } from "@/components/views/OnBoardView";


export default function Home() {
  const { ingestState } = useRepoStore();

  return (
    <div className="flex h-full w-full p-16 justify-center items-center">
      <motion.div
        transition={{
          duration: 0.25,
          delay: 0.1
        }}
        layout
      >
        <Card className="rounded-3xl p-8 xl:p-16 border-2">
          {ingestState === "idle" ?
            <HomeView /> :
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.2 }}
            >
              <OnBoardView />
            </motion.div>
          }
        </Card>
      </motion.div>
    </div >);
}
