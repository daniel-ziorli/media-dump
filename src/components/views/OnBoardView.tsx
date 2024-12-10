import { useState } from "react"
import { Card } from "@/components/ui/card"
import { FaArrowRight } from "react-icons/fa";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function OnBoardView() {
  const [url, setUrl] = useState("")

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const handleSubmit = () => {
    console.log("url", url);

    //TODO: submit name to server
  }

  return (
    <div className="flex h-full w-full p-16 justify-center items-center">
      <Card className="rounded-3xl p-8 xl:p-16">
        <div className="flex flex-col gap-4 justify-center mx-auto h-full w-full max-w-2xl p-8">
          <h1 className="text-6xl font-bold">up2speed</h1>
          <p className="text-2xl -mt-2">
            Start contributing to repos in hours, not weeks by quickly uncovering the most relevant code and resources
          </p>

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
              />
            </div>

            <Button
              className="bg-gradient-to-br from-pink-600 to-purple-600"
              onClick={handleSubmit}
            >
              <FaArrowRight className="text-slate-100" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

