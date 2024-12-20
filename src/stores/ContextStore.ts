import { hybridSearch } from "@/components/utils/WeaviateUtils";
import { WeaviateObject } from "weaviate-client";
import { create } from "zustand";
import { RepoTree, useRepoStore } from "./RepoStore";
import { getFilesByPath } from "@/components/utils/TreeUtils";

interface ContextStore {
  contextState: string;
  context: WeaviateObject<undefined>[];
  selectedContext: number;
  fileContext: RepoTree[];
  getContext: (query: string) => Promise<WeaviateObject<undefined>[]>;
  setSelectedFile: (path: string, line?: number) => void;
}

export const useContextStore = create<ContextStore>((set, get) => ({
  contextState: "",
  context: [],
  selectedContext: 0,
  fileContext: [],
  // fileContext: [
  //   {
  //     "name": "Settings.jsx",
  //     "path": "src/Settings.jsx",
  //     "type": "file",
  //     "content": "import { useState, useRef, useEffect } from 'react';\nimport { readLocalStorage, writeLocalStorage } from './utils';\n\nconst SettingsModal = () => {\n  const [open, setOpen] = useState(false);\n  const [apiKey, setApiKey] = useState('');\n  const [systemPrompt, setSystemPrompt] = useState('');\n  const [personalInfo, setPersonalInfo] = useState('');\n  const modalRef = useRef(null);\n\n  const handleOpen = () => {\n    setOpen(true);\n  };\n\n  const handleClose = () => {\n    setOpen(false);\n  };\n\n  const handleApiKeyChange = (event) => {\n    setApiKey(event.target.value);\n  };\n\n  const handleSystemPromptChange = (event) => {\n    setSystemPrompt(event.target.value);\n  };\n\n  const handlePersonalInfoChange = (event) => {\n    setPersonalInfo(event.target.value);\n  };\n\n  const handleSave = async () => {\n    await writeLocalStorage('apiKey', apiKey);\n    await writeLocalStorage('systemPrompt', systemPrompt);\n    await writeLocalStorage('personalInfo', personalInfo);\n    handleClose();\n  };\n\n  const handleClickOutside = (event) => {\n    if (modalRef.current && !modalRef.current.contains(event.target)) {\n      handleClose();\n    }\n  };\n\n  useEffect(() => {\n    const loadSystemPrompt = async () => {\n      try {\n        const storedSystemPrompt = await readLocalStorage('systemPrompt');\n        setSystemPrompt(storedSystemPrompt);\n      } catch {\n        const defaultSystemPrompt = `You are a helpful assistant`;\n        setSystemPrompt(defaultSystemPrompt);\n      }\n\n      try {\n        const storedApiKey = await readLocalStorage('apiKey');\n        setApiKey(storedApiKey);\n      } catch (error) {\n        console.log(error);\n      }\n\n      try {\n        const storedPersonalInfo = await readLocalStorage('personalInfo');\n        setPersonalInfo(storedPersonalInfo);\n      } catch {\n        const defaultPersonalInfo = ``;\n        setPersonalInfo(defaultPersonalInfo);\n      }\n    };\n    if (open) {\n      loadSystemPrompt();\n    }\n  }, [open]);\n\n  return (\n    <div>\n      <button onClick={handleOpen} className=\"bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded\">\n        Settings\n      </button>\n      {open && (\n        <div className=\"fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center\" onClick={handleClickOutside}>\n          <div className=\"bg-gray-800 p-6 rounded shadow-lg w-full max-w-2xl\" ref={modalRef}>\n            <button className=\"absolute top-0 right-0 p-2\" onClick={handleClose}>\n              <svg className=\"w-6 h-6 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" /></svg>\n            </button>\n            <h2 className=\"text-2xl font-bold mb-4 text-white\">Settings</h2>\n            <p className=\"text-sm\">API Key</p>\n            <input\n              type=\"text\"\n              value={apiKey}\n              onChange={handleApiKeyChange}\n              className=\"bg-gray-700 border border-gray-600 rounded py-2 px-4 w-full mb-4 text-white\"\n              placeholder=\"API Key\"\n            />\n            <p className=\"text-sm\">System Prompt</p>\n            <textarea\n              value={systemPrompt}\n              onChange={handleSystemPromptChange}\n              className=\"bg-gray-700 border border-gray-600 rounded py-2 px-4 w-full mb-4 text-white resize-none\"\n              placeholder=\"System Prompt\"\n              rows={5}\n            />\n            <p className=\"text-sm\">Personal Info</p>\n            <textarea\n              value={personalInfo}\n              onChange={handlePersonalInfoChange}\n              className=\"bg-gray-700 border border-gray-600 rounded py-2 px-4 w-full mb-4 text-white resize-none\"\n              placeholder=\"Personal Info\"\n              rows={14}\n            />\n            <button onClick={handleSave} className=\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full\">\n              Save\n            </button>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default SettingsModal;\n",
  //     "line": 38
  //   },
  //   {
  //     "name": "postcss.config.js",
  //     "path": "postcss.config.js",
  //     "type": "file",
  //     "content": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n"
  //   },
  //   {
  //     "name": "README.md",
  //     "path": "README.md",
  //     "type": "file",
  //     "content": "# Browser Chat\n\nBrowser Chat is a Chrome extension that provides a chatbot interface for\ninteracting with the user through a web browser, with their current tabs\ncontext. It leverages the power of React and Vite for development.\n\n## Features\n\n- Chatbot Interface: Users can send messages to the chatbot and receive\n  responses.\n- API Key and System Prompt Storage: The extension stores the API key and system\n  prompt in the browser's local storage.\n- HTML Content Retrieval: The extension retrieves the HTML content of the active\n  tab in the browser using the `chrome.tabs.sendMessage` API.\n- Youtube Transcript Retrieval: The extension is also able to read the\n  transcript of youtube videos to provide context to the LLM.\n- Settings: Users can customize the system prompt and API key through the\n  settings modal.\n- Error Handling: The extension handles various error scenarios, such as when\n  there is an issue retrieving the HTML content or when there is an error with\n  the Google Generative AI API.\n\n## Getting Started\n\n1. Clone this repository\n2. Run `npm install`\n3. Run `npm run build`\n4. Open Chrome and go to `chrome://extensions`\n5. Enable Developer Mode\n6. Click on \"Load unpacked\" and select the dist folder\n7. Pin the extension\n\n## Usage\n\n1. Open a web page in Chrome\n2. Click on the Browser Chat extension icon in the toolbar\n3. Open settings and add your Google API key from\n   [here](https://aistudio.google.com/app/apikey) (this is stored locally)\n4. Start chatting with the chatbot!\n"
  //   }
  // ],

  getContext: async (query: string) => {
    set({ contextState: "Fetching context from Weaviate..." });
    const query_results = await hybridSearch(query);
    set({ context: query_results.objects, contextState: "" });

    // unique set of file paths filtering out non strings sorry god
    const file_paths = [...new Set(query_results.objects.map((item) => item.properties?.file_path).filter((item) => typeof item === 'string'))];
    console.log("file_paths: " + file_paths);

    const { repoTree } = useRepoStore.getState();
    if (!repoTree) {
      throw new Error('Repo tree not found');
    }
    const files: RepoTree[] = [];
    for (const file_path of file_paths) {
      const file = getFilesByPath(repoTree, file_path)[0];
      if (file) files.push(file);
    }

    set({ fileContext: files });

    console.log(get().context);

    console.log(get().fileContext);

    return query_results.objects;
  },


  setSelectedFile: (path: string, line?: number) => {
    console.log(`zustand setFileLine: ${path} ${line}`);
    const index = get().fileContext.findIndex((file) => file.path === path);
    set({ selectedContext: index });
    if (!line) return;

    set((state) => {
      const fileContext = state.fileContext.map((file) => {
        if (file.path === path) {
          return { ...file, line };
        }
        return file;
      });
      return { fileContext };
    });
    console.log(get().fileContext);
  },
}));