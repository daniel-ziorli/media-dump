import { generateChatStream } from "@/components/utils/LLMUtils";
import { hybridSearch } from "@/components/utils/WeaviateUtils";
import OpenAI from "openai";
import { create } from "zustand";

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

    const context = await hybridSearch(message);
    console.log(context);


    const messages: IMessage[] = [
      {
        role: "system",
        content: `
        You are a code base assistant named Bob.
        Your goal is to answer questions about a code base and help developers navigate and understand the code base.

        output format:
        respond in mark down format
        in every instance of referencing a file or folder within your response you must always include a markdown link to the full path.

        example 1:
        you're talking about a file called main.py
        you must include a markdown link to the file [main.py](/path/to/main.py) whenever referencing the file

        example 2:
        The [Settings.jsx](/src/components/Settings.jsx) file is a React component that manages a settings modal for a user interface.

        example 3:
        The [App.jsx](/src/components/App.jsx) file is a React component that represents the main application interface.
        Inside the App component, there is a [Home.jsx](/src/components/Home.jsx) component and an [About.jsx](/src/components/About.jsx) component.
        `
      },
      ...useChatStore.getState().messages
    ];
    messages[messages.length - 1] = {
      role: "user" as "user" | "assistant" | "system",
      content: `<context>
      ${context.objects.map((object) => JSON.stringify(object.properties)).join('\n')}
      </context>
      
      ${messages[messages.length - 1].content}`
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



