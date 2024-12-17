"use client";

import { HomeView } from "@/components/views/HomeView";
import { motion } from "framer-motion"
import { useRepoStore } from "@/stores/RepoStore";
import { Card } from "@/components/ui/card";
import { OnBoardView } from "@/components/views/OnBoardView";
import { useOnBoardStore } from "@/stores/OnBoardStore";
import { SearchView } from "@/components/views/SearchView";


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
            <div className="p-4 h-[100vh] w-[100vw] grid grid-cols-2 gap-4">
              <Card className="">
              </Card>
              <Card className="">
              </Card>
            </div>
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
