'use server';

import { OpenAI } from "openai";
import { RepoTree } from "@/stores/RepoStore";
import { getFilesByName, removeContentFieldsFromTree } from "./TreeUtils";
import { hybridSearch } from "./WeaviateUtils";

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

export async function createOverview(tree: RepoTree) {
  const readme = getFilesByName(tree, 'readme.md')[0].content;
  // const entry_point_context = await hybridSearch("entrypoint");
  // const overview_context = await hybridSearch("overview");
  // const important_context = await hybridSearch("important");

  const tree_stripped = removeContentFieldsFromTree(tree);

  const response = await llmClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert technical writer. Your goal is to write an overview for a Github repository that is useful for onboarding new developers." },
      {
        role: "user", content: `
          Generate an overview with the following context:
          <readme>
          ${readme}
          </readme>
          <repository tree>
          ${JSON.stringify(tree_stripped)}
          </repository tree>

          do not include any information about installation, pre-requisites, or usage.
          you will give a comprehensive overview of the repository and its contents.
          mention things like structure, entry points, etc.

          follow the following steps:
          1. read through the given context and understand the contents.
          2. generate a title and a 1 - 2 sentence description of the repository.
          3. create a structure title and a 1 - 2 sentence description of the structure.
            this section should give the developer a good understanding of how the repository is structured in terms of files and folders.
          4. create an entry points title and a list of 1 - 5 entry points.
            this section should give the developer a good starting point for using the repository.

          output format:
          respond in mark down format
          when talking about a file within the repository you must always link the to files path.

          <example>
          # Project Title
          This project is designed to [explain purpose] and provides [key functionality].

          ## Repository Structure

          The project contains several key folders
          1. [src/](src/) The source code for the application.
          2. [api/](api/) The API endpoints for the application.
          3. [tests/](tests/) The unit and integration tests for the application.
          4. [docs/](docs/) The documentation for the application.

          Additionally, there are configuration files like [requirements.txt](requirements.txt), [README.md](README.md), and [.gitignore](.gitignore).

          ## Entry Points
          1. **Main Application**
            - [src/main.py](src/main.py) The primary entry point for running the application.

          2. **API Endpoints** 
            - [api/endpoints.py](api/endpoints.py) Core endpoints that handle HTTP requests and responses.
          </example>

          <example>
          # Project Title
          **A brief description of your repository goes here.**  
          This project is designed to [explain purpose] and provides [key functionality].

          ## Repository Structure

          The project contains several key folders:
          - [src/](src/) for the source code, which is further divided into the backend and frontend code.  
          - [backend/](src/backend/) for the backend logic, including API routes and services.  
          - [frontend/](src/frontend/) for the frontend application, typically React or another framework.  
          Additionally, there are configuration files like [package.json](package.json), [README.md](README.md), and [.gitignore](.gitignore).

          ## Entry Points
          1. **Backend**  
            - [src/backend/server.js](src/backend/server.js) The main backend entry point, where the server is initialized and API routes are defined.
            - [src/backend/routes.js](src/backend/routes.js) Defines API routes for handling requests and responses.

          2. **Frontend**  
            - [src/frontend/index.js](src/frontend/index.js) The main entry point for the frontend application, typically where the React app or other framework is bootstrapped.
          </example>

          note: focus on readability, not completeness. developers should be able to quickly scan through the overview and get a good idea of the structure and where to start.
        `
      },
    ],
    temperature: 0.1,
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
            If the chunk would be useful in creating an overview of the application in an onboarding guide, state that with 'overview'.
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

export async function generateChatStream(messages: { role: "user" | "assistant" | "system", content: string }[]) {
  const stream = await llmClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.1,
    max_tokens: 1000,
    stream: true
  });

  return stream;
}