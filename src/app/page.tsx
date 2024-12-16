"use client";

import { HomeView } from "@/components/views/HomeView";
import { IngestView } from "@/components/views/IngestView";
import { motion } from "framer-motion"
import { useRepoStore } from "@/stores/RepoStore";
import { Card } from "@/components/ui/card";
import { SearchView } from "@/components/views/SearchView";
import { OnBoardView } from "@/components/views/OnBoardView";
import { hybridSearch } from "@/components/utils/WeaviateUtils";


export default function Home() {
  const { ingestState } = useRepoStore();

  const test = () => {
    const result = hybridSearch("important");
    console.log(result);
    const result2 = hybridSearch("backend");
    console.log(result2);

    const result3 = hybridSearch("installation");
    console.log(result3);
  }


  return (
    <div className="flex h-full w-full p-8 justify-center items-center">
      <motion.div
        transition={{
          duration: 0.25,
          delay: 0.1
        }}
        layout
      >
        <Card className="rounded-3xl p-8 border-2">
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
        <button onClick={test}>test</button>
      </motion.div>
    </div >);
}
