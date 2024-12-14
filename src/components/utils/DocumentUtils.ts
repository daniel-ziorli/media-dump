'use client';
import axios from 'axios';
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguages } from "@langchain/textsplitters";
import { RepoTree } from '@/stores/RepoStore';
import { flattenRepoTree } from './TreeUtils';

interface GitHubContentItem {
  type: 'file' | 'dir';
  path: string;
  content?: string;
  encoding?: string;
}
console.log(process.env.GITHUB_APIKEY);

const IGNORED_FILE = ['package-lock.json'];
const IGNORED_DIR = ['node_modules'];

export async function getFilesFromGithubRepo(repoUrl: string, logger: (message: string) => void): Promise<RepoTree> {
  try {
    const match = repoUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL.');
    }

    const [, owner, repo] = match;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    const repoTree: RepoTree = { name: '', type: 'folder', children: [] };
    const fetchFiles = async (path: string = '', repoTree: RepoTree): Promise<RepoTree> => {
      logger(`Fetching files from ${apiUrl}/${path}`);
      const response = await axios.get<GitHubContentItem[]>(`${apiUrl}/${path}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
        },
      });

      const items: GitHubContentItem[] = response.data;

      for (const item of items) {
        if (item.type === 'file' && !item.path.startsWith('.') && !IGNORED_FILE.includes(item.path.split('/').pop() || '')) {
          logger(`Downloading content from file ${item.path}`);
          const fileResponse = await axios.get(`${apiUrl}/${item.path}`, {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
            },
          });
          let content = fileResponse.data;
          if (typeof content === 'object') {
            content = JSON.stringify(content);
          }

          const fileName = item.path.split('/').pop() || '';
          repoTree.children?.push({ name: fileName, type: 'file', content });
        } else if (item.type === 'dir' && !IGNORED_DIR.includes(item.path.split('/').pop() || '')) {
          logger(`Fetching files from ${apiUrl}/${item.path}`);
          if (!repoTree.children) {
            throw new Error('Failed to fetch files from GitHub repository.');
          }
          repoTree.children.push({ name: item.path.split('/').pop() || '', type: 'folder', children: [] });
          await fetchFiles(item.path, repoTree.children[repoTree.children.length - 1] as RepoTree);
        }
      }

      return repoTree;
    };

    return await fetchFiles('', repoTree);
  } catch (error) {
    throw new Error(`Failed to fetch files from GitHub repository: ${error}`);
  }
}

export async function chunkFiles(repo: RepoTree, logger: (message: string) => void) {
  const output: { path: string, chunks: string[] }[] = [];
  const files: { path: string, content: string }[] = flattenRepoTree(repo);

  for (const file of files) {
    const extension = file.path.split('.').pop();
    if (!extension) {
      continue;
    }

    let text_splitter: RecursiveCharacterTextSplitter | null = null;
    // im sure there is a better way but im not going to spend more time on silly types
    SupportedTextSplitterLanguages.forEach((lang) => {
      if (extension === lang) {
        text_splitter = RecursiveCharacterTextSplitter.fromLanguage(lang, { chunkSize: 1000, chunkOverlap: 200 });
      }
    })

    if (!text_splitter) {
      text_splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    }

    logger(`Chunking file ${file.path}`);
    const chunks = await text_splitter.splitText(file.content);
    output.push({ path: file.path, chunks });
  }

  return output;
}



export async function chunkFilesWithTreeSitter(repo: RepoTree, logger: (message: string) => void) {
  const output: { path: string, chunks: string[] }[] = [];
  const files: { path: string, content: string }[] = flattenRepoTree(repo);

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
      text_splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    }

    logger(`Chunking file ${file.path}`);
    const chunks = await text_splitter.splitText(file.content);
    output.push({ path: file.path, chunks });
  }

  return output;
}


