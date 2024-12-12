"use client";

import { FaArrowRight } from "react-icons/fa";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRepoStore } from "@/stores/RepoStore";


export function OnBoardView() {
  const { url, urlError, setUrl, ingest } = useRepoStore();
  // const [logs, setLogs] = useState<string[]>([])


  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  // const handleSubmit = async () => {
  // if (!url.match(/^https?:\/\/github\.com\/.+\/.+$/) || !url) {
  //   setUrlError("Enter a valid github url")
  //   return;
  // }
  // setLogs([]);
  // setPage("ingest");

  // const logger = (message: string) => {
  //   setLogs((prevLogs) => [...prevLogs, message])
  // }


  // }

  return (
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
                  ingest();
                }
              }}
              pattern="https?://github.com/.+/.+"
              title="Enter a valid github url"
              required
            />
          </div>

          <Button
            className="bg-gradient-to-br from-pink-600 to-purple-600"
            onClick={ingest}
          >
            <FaArrowRight className="text-slate-100" />
          </Button>
        </div>
        <p className={"text-red-500 text-destructive text-sm h-[0px] ml-4 overflow-visible" + (urlError ? "visible" : "invisible")} >{urlError}</p>
      </div>
    </div>
  )
}

