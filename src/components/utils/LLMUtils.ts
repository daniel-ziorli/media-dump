'use server';

import { OpenAI } from "openai";
import { RepoTree } from "@/stores/RepoStore";
import { getFilesByName } from "./TreeUtils";

const llmClient = new OpenAI({
  apiKey: process.env['OPENAI_APIKEY'],
});

export async function createInstallationGuide(tree: RepoTree, repoUrl: string) {
  const readme = getFilesByName(tree, 'readme.md')[0].content;

  const response = await llmClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert technical writer. Your goal is to write an installation guide for a Github repository." },
      {
        role: "user", content: `
                Generate an installation guide from the following readme
                <readme>
                ${readme}
                </readme>

                Here is the repository https url for cloning and the ssh url, both of which must be included
                <httpCloneUrl>
                ${repoUrl}.git
                </httpCloneUrl>
                <SSHUrl>
                git@github.com:${repoUrl.split('https://github.com/')[1]}.git
                </sshCloneUrl>

                First outline any pre-requisites described in the readme or that you can infer from the readme.
                This could include:
                Api keys, secrets, tokens, credentials, environment variables, etc.
                Specific programs required to be installed, such as Docker, Node.js, Python, etc. Be sure to include a specific version if applicable.
                Link to any pre-requisites in the installation guide.

                Then list every step of the installation process.

                Only include the pre-requisites and installation steps and no other additional information.
                Use markdown format and use code blocks for console commands.
                `
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

export async function generateChunkProperties(chunk: string): Promise<{ content: string, tags: string[] }> {
  const response = await llmClient.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", content: "You are an expert technical writer. Your goal is to categorize chunks of code, config, documentation and other files in a way that is easy to query in a vector database."
      },
      {
        role: "user",
        content: `
          Generate a tags for the following chunk of code
          <code_chunk>
          ${chunk}
          </code_chunk>

          Use the following steps to generate the tags:
          1. Read through the code thoroughly and understand its purpose and functionality.
          2. Generate a list of tags that describe the code.
            Identify the type of text, such as code, config, documentation, or other.
            If the chunk is used for the backend of the application, state that it is used for the backend with 'backend'.
            If the chunk is used for the frontend of the application, state that it is used for the frontend with 'frontend'.
            If the chunk is used for the database of the application, state that it is used for the database with 'database'.
            If the chunk is used during the installation process, state that it is used during the installation process with 'installation'.
            If the chunk is an entrypoint for the application such as a main function or an api endpoint, state that it is an entrypoint with 'entrypoint'.
            If the chunk is important for the application, state that it is important with 'important'.
        `,
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generate_chunk_properties",
        description: "generates tags for a chunk of code, config, documentation and other files",
        schema: {
          type: "object",
          properties: {
            chunk_tags: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (content === null) {
      console.error("Content is null in generateChunkProperties: " + response);
      return { content: chunk, tags: [] };
    }
    const parsedResponse = JSON.parse(content);
    const { chunk_tags } = parsedResponse;
    return { content: chunk, tags: chunk_tags };
  } catch (error) {
    console.error(error);
    return { content: chunk, tags: [] };
  }
}