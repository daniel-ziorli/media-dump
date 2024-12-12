"use client";

import { useState } from "react"
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { chunkFiles, getFilesFromGithubRepo } from "../utils/DocumentUtils";
import { importDocuments } from "../utils/WeaviateUtils";

export function OnBoardView() {
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [page, setPage] = useState<"onboard" | "ingest">("onboard")
  const [logs, setLogs] = useState<string[]>([])


  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlError("")
    setUrl(e.target.value)
  }

  const handleSubmit = async () => {
    if (!url.match(/^https?:\/\/github\.com\/.+\/.+$/) || !url) {
      setUrlError("Enter a valid github url")
      return;
    }
    setLogs([]);
    setPage("ingest");

    const logger = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, message])
    }

    try {
      const results = await getFilesFromGithubRepo(url, logger);

      console.log(results);

      const documents = await chunkFiles(results, logger);

      console.log(documents);

      const import_result = await importDocuments(documents);

      console.log(import_result);

    } catch {
      setUrlError("Error fetching repository. Make sure it's public.");
      setPage("onboard");
    }
  }

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

          {page === "onboard" ? (
            <div className="flex flex-col gap-4 justify-center mx-auto h-full w-full max-w-2xl p-8">
              <h1 className="text-6xl font-bold">up2speed</h1>
              <p className="text-2xl -mt-2">
                Start contributing to repos in hours, not weeks by quickly uncovering the most relevant code and resources
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex gap-4 mt-4">
                  <div className="card-wrapper w-full">
                    <Input
                      className="card-content"
                      placeholder="Enter a github url..."
                      value={url}
                      onChange={handleUrlChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit();
                        }
                      }}
                      pattern="https?://github.com/.+/.+"
                      title="Enter a valid github url"
                      required
                    />
                  </div>

                  <Button
                    className="bg-gradient-to-br from-pink-600 to-purple-600"
                    onClick={handleSubmit}
                  >
                    <FaArrowRight className="text-slate-100" />
                  </Button>
                </div>
                <p className={"text-red-500 text-destructive text-sm h-[0px] ml-4 overflow-visible" + (urlError ? "visible" : "invisible")} >{urlError}</p>
              </div>

            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={page === "ingest" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.2 }}
            >
              <div className="w-[800px] h-[60vh] flex flex-col gap-2">
                <code
                  className="bg-black rounded-sm p-2 h-full overflow-y-scroll border-2"
                  ref={(ref) => {
                    if (ref) {
                      ref.scrollTop = ref.scrollHeight;
                    }
                  }}
                >
                  {
                    logs.map((log, index) => (
                      <p key={index} className="text-[#f8f8f2]">{log}</p>
                    ))
                  }
                </code>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

    </div>
  )
}

