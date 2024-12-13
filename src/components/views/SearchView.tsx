"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { hybridSearch } from "../utils/WeaviateUtils";
import Markdown from 'react-markdown'


export function SearchView() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string>("");

  const handleSearch = async () => {
    const response = await hybridSearch(query);
    setResult(response.generated || "");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 h-full w-full">
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Card className="w-full">
        <Markdown>{result}</Markdown>
      </Card>
    </div>
  );
}
