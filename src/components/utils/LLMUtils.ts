'use server';

import { OpenAI } from "openai";
import { RepoTree, useRepoStore } from "@/stores/RepoStore";
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