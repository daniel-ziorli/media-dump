import { generateChatStream } from "@/components/utils/LLMUtils";
import { create } from "zustand";
import { useContextStore } from "./ContextStore";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatStore {
  messages: IMessage[];
  addMessage: (message: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: async (message: string) => {
    set((state) => ({ messages: [...state.messages, { role: "user", content: message }] }))

    const context = await useContextStore.getState().getContext(message);

    const messages: IMessage[] = [
      {
        role: "system",
        content: `
        You are a code base assistant named Bob.
        Your goal is to respond to a users query about a code base and help developers navigate and understand the code base.
        You must explain to the developer how things work and reference files and code in the code base so they can easily navigate to the right place.

        output format:
        respond in mark down format
        in every instance when referencing a file or folder you must include a code block with the following format: \`[path/to/file](title)\`
        in every instance when referencing a line in a file you must include a code block with the following format: \`[path/to/file:line](title)\`
        `
      },
      ...useChatStore.getState().messages
    ];
    messages[messages.length - 1] = {
      role: "user" as "user" | "assistant" | "system",
      content: `
      <context>
      ${context.map((object) => JSON.stringify(object.properties)).join('\n')}
      </context>

      Follow these instructions when responding:
      1. read through the context and understand the code base
      2. read through the question and understand the question
      3. think about any possible file references you will respond with
        you must reference all files in the following format: \`[path/to/file](title)\`
        note: path/to/file is the path to the file and title is what the user will see
        if you don't reference a file correctly or you don't reference a file at all I will lose my job
      4. think about any possible line references you will respond with, this could be a line of code or a function etc.
        you must reference all line references in the following format: \`[path/to/file:line](title)\`
        note: path/to/file is the path to the file and line is the line number and title is what the user will see
        if you don't reference a line correctly or you don't reference a line at all I will lose my job
      5. when using code block you must think about if it the contents can be referenced.
        think about the code you're going to put in the code block and if it can be referenced
        if it can be referenced you must reference it in the following format: \`[path/to/file:line](title)\`


      example 1:
      In \`[src/Settings.tsx](Settings.tsx)\` there are 2 main functions:
      \`[src/Settings.tsx:1](setState())\` this is a function that sets the state
      \`[src/Settings.tsx:12](clearSettings())\` this is used to reset the user settings

      example 2:
      In \`[src/Settings.tsx](Settings.tsx)\` there is a function that is used to set the theme:
      \`[src/Settings.tsx:7](setTheme())\` this is a function that sets the theme

      example 3:
      In \`[src/Settings.tsx](Settings.tsx)\` there is a function that is used to set the font size:
      \`[src/Settings.tsx:11](setFontSize())\` this is a function that sets the font size

      example 4:
      The modal can be opened and closed using the \`[src/modal.tsx:123](handleOpen())\` and \`[src/modal.tsx:133](handleClose())\` functions.

      example 5:
      You can add new messages with the \`[src/Chat.tsx:123](addMessage())\` function and remove messages with the \`[src/Chat.tsx:133](removeMessage())\` function.

      please read through all the instructions and examples carefully to align your response with the instructions

      user query:
      ${messages[messages.length - 1].content}

      response:
      `
    };

    const responseStream = await generateChatStream(messages);

    set((state) => ({ messages: [...state.messages, { role: "assistant", content: "" }] }))

    for await (const chunk of responseStream) {
      const messages = useChatStore.getState().messages;
      const lastMessage = messages[messages.length - 1];
      lastMessage.content += chunk.choices[0].delta?.content ?? '';
      set({ messages });
    }
  },
  clearMessages: () => set({ messages: [] }),
}));



