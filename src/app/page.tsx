"use client";

import { HomeView } from "@/components/views/HomeView";
import { motion } from "framer-motion"
import { useRepoStore } from "@/stores/RepoStore";
import { Card } from "@/components/ui/card";
import { OnBoardView } from "@/components/views/Onboarding/OnBoardView";
import { useOnBoardStore } from "@/stores/OnBoardStore";
import { SearchView } from "@/components/views/SearchView";
import { AppView } from "@/components/views/App/AppView";


export default function Home() {
  const { onBoardState } = useOnBoardStore();

  return (
    <div className="flex h-full w-full p-8 justify-center items-center">
      <motion.div
        transition={{
          duration: 0.25,
          delay: 0.1
        }}
        layout
      >

        {onBoardState === "complete" ?
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.2 }}
            className="w-full h-full"
          >
            <AppView />
          </motion.div>
          :
          <Card className="rounded-3xl p-8 border-2">
            {(onBoardState === "idle" || onBoardState === "error") &&
              <HomeView />
            }

            {onBoardState === "inprogress" &&
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.2 }}
              >
                <OnBoardView />
              </motion.div>
            }
          </Card>
        }
      </motion.div>
    </div >);
}
