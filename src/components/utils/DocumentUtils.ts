'use client';
import axios from 'axios';
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguages } from "@langchain/textsplitters";
import { IChunk, RepoTree } from '@/stores/RepoStore';
import { flattenRepoTree } from './TreeUtils';
import { generateChunkTags } from './LLMUtils';

interface GitHubContentItem {
  type: 'file' | 'dir';
  path: string;
  content?: string;
  encoding?: string;
}
console.log(process.env.GITHUB_APIKEY);

const IGNORED_FILE = ['package-lock.json'];
const IGNORED_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg'];
const IGNORED_DIR = ['node_modules'];

export async function getFilesFromGithubRepo(repoUrl: string, logger: (message: string) => void): Promise<RepoTree> {
  try {
    const match = repoUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL.');
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    const repoTree: RepoTree = { name: '', path: '', type: 'folder', children: [] };
    const fetchFiles = async (path: string = '', repoTree: RepoTree): Promise<RepoTree> => {
      logger(`Fetching files from ${apiUrl}/${path}`);
      const response = await axios.get<GitHubContentItem[]>(`${apiUrl}/${path}`, {
        headers: {
          'Accept': 'application/vnd.github.raw+json',
          'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
        },
      });

      const items: GitHubContentItem[] = response.data;

      for (const item of items) {
        const extension = item.path.split('.').pop() || '';
        const file_name = item.path.split('/').pop() || '';

        if (item.type === 'file' && !file_name.startsWith('.') && !IGNORED_FILE.includes(file_name) && !IGNORED_FILE_EXTENSIONS.includes(extension)) {
          logger(`Downloading content from file ${item.path}`);
          const fileResponse = await axios.get(`${apiUrl}/${item.path}`, {
            headers: {
              'Accept': 'application/vnd.github.raw+json',
              'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
            },
          });

          let content = fileResponse.data.content;
          console.log("item: " + item);

          if (fileResponse.data.encoding === 'base64') {
            content = Buffer.from(content, 'base64').toString('utf-8');
          }

          console.log("content: " + content);

          if (typeof content === 'object') {
            content = JSON.stringify(content);
          }

          const fileName = item.path.split('/').pop() || '';
          repoTree.children?.push({ name: fileName, path: item.path, type: 'file', content });
        } else if (item.type === 'dir' && !IGNORED_DIR.includes(item.path.split('/').pop() || '')) {
          logger(`Fetching files from ${apiUrl}/${item.path}`);
          if (!repoTree.children) {
            throw new Error('Failed to fetch files from GitHub repository.');
          }
          repoTree.children.push({ name: item.path.split('/').pop() || '', path: item.path, type: 'folder', children: [] });
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
  const output: { file_name: string, file_path: string, chunks: IChunk[] }[] = [];
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
        text_splitter = RecursiveCharacterTextSplitter.fromLanguage(lang, { chunkSize: 1000, chunkOverlap: 0 });
      }
    })

    if (!text_splitter) {
      text_splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    }

    logger(`Chunking file ${file.path}`);
    const chunks = await text_splitter.splitText(file.content);
    const file_lines = file.content.split('\n').map((line) => line.trim());

    const generated_chunks: IChunk[] = [];

    let start_line = 0;
    for (const chunk of chunks) {
      const chunk_lines = chunk.split('\n');

      start_line = file_lines.indexOf(chunk_lines[0].trim(), start_line);
      const end_line = start_line + chunk_lines.length - 1;

      const tags = await generateChunkTags(chunk);

      generated_chunks.push({
        file_name: file.path.split('/').pop() || '',
        file_path: file.path,
        content: chunk,
        tags,
        start_line: start_line + 1,
        end_line: end_line + 1,
      });

    }

    output.push({ file_name: file.path.split('/').pop() || '', file_path: file.path, chunks: generated_chunks });
  }

  return output;
}
