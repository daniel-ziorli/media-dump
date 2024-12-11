'use client';
import axios from 'axios';

interface GitHubContentItem {
  type: 'file' | 'dir';
  path: string;
  content?: string;
  encoding?: string;
}
console.log(process.env.GITHUB_APIKEY);

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
        if (item.type === 'file') {
          logger(`Downloading content from file ${item.path}`);
          console.log(`${apiUrl}/${item.path}`);

          const fileResponse = await axios.get(`${apiUrl}/${item.path}`, {
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${process.env.GITHUB_APIKEY}`,
            },
          });
          console.log(fileResponse);

          fileContents.push({ path: `${apiUrl}/${item.path}`, content: fileResponse.data });
        } else if (item.type === 'dir') {
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
