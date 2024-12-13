'use client';
import axios from 'axios';
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguages } from "@langchain/textsplitters";


interface GitHubContentItem {
  type: 'file' | 'dir';
  path: string;
  content?: string;
  encoding?: string;
}
console.log(process.env.GITHUB_APIKEY);

const IGNORED_FILE = ['package-lock.json'];
const IGNORED_DIR = ['node_modules'];

export async function getFilesFromGithubRepo(repoUrl: string, logger: (message: string) => void): Promise<{ path: string, content: string }[]> {
  try {
    const match = repoUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL.');
    }

    const [, owner, repo] = match;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;


    const fetchFiles = async (path: string = ''): Promise<{ path: string, content: string }[]> => {
      logger(`Fetching files from ${apiUrl}/${path}`);
      const response = await axios.get<GitHubContentItem[]>(`${apiUrl}/${path}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
        },
      });

      const items: GitHubContentItem[] = response.data;
      const fileContents: { path: string, content: string }[] = [];

      for (const item of items) {
        if (item.type === 'file' && !item.path.startsWith('.') && !IGNORED_FILE.includes(item.path.split('/').pop() || '')) {
          logger(`Downloading content from file ${item.path}`);
          console.log(`${apiUrl}/${item.path}`);

          const fileResponse = await axios.get(`${apiUrl}/${item.path}`, {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
            },
          });
          console.log(fileResponse);

          let content = fileResponse.data;
          if (typeof content === 'object') {
            content = JSON.stringify(content);
          }

          fileContents.push({ path: `${apiUrl}/${item.path}`, content });
        } else if (item.type === 'dir' && !IGNORED_DIR.includes(item.path.split('/').pop() || '')) {
          logger(`Fetching files from ${apiUrl}/${item.path}`);
          const subContents = await fetchFiles(item.path);
          fileContents.push(...subContents);
        }
      }

      return fileContents;
    };

    return await fetchFiles();
  } catch (error) {
    throw new Error(`Failed to fetch files from GitHub repository: ${error}`);
  }
}

export type TextSplitter = "cpp" | "go" | "java" | "js" | "php" | "proto" | "python" | "rst" | "ruby" | "rust" | "scala" | "swift" | "markdown" | "latex" | "html" | "sol";

export async function chunkFiles(files: { path: string, content: string }[], logger: (message: string) => void) {
  const output: { path: string, chunks: string[] }[] = [];
  for (const file of files) {
    const extension = file.path.split('.').pop();
    if (!extension) {
      continue;
    }

    let text_splitter: RecursiveCharacterTextSplitter | null = null;
    // im sure there is a better way but im not going to spend more time on silly types
    SupportedTextSplitterLanguages.forEach((lang) => {
      if (extension === lang) {
        text_splitter = RecursiveCharacterTextSplitter.fromLanguage(lang, { chunkSize: 512, chunkOverlap: 0 });
      }
    })

    if (!text_splitter) {
      text_splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 100 });
    }

    logger(`Chunking file ${file.path}`);
    const chunks = await text_splitter.splitText(file.content);
    output.push({ path: file.path, chunks });
  }

  return output;
}


