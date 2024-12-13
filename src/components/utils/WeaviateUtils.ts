"use server";

import weaviate, { dataType, GenerateOptions, vectorizer, WeaviateClient } from 'weaviate-client';



export async function importDocuments(documents: { path: string, chunks: string[] }[]) {
  "use server";
  console.log('importing documents');
  const weaviateClient: WeaviateClient = await weaviate.connectToLocal({
    host: 'weaviate',
    port: 8080
  });
  const isReady = await weaviateClient.isReady();
  if (!isReady) {
    throw new Error('Weaviate is not ready');
  }

  if (await weaviateClient.collections.exists('CodeFile')) {
    await weaviateClient.collections.delete('CodeFile');
  }

  const returnedCollection = await weaviateClient.collections.create({
    name: 'CodeFile',
    properties: [
      {
        name: 'file_path',
        dataType: dataType.TEXT,
      },
      {
        name: 'chunk_index',
        dataType: dataType.INT,
        description: 'The chunk index of the chunk in the file',
      },
      {
        name: 'content',
        dataType: dataType.TEXT,
      },
    ],
    vectorizers: [
      vectorizer.text2VecOpenAI({
        model: 'text-embedding-3-small',
        dimensions: 512
      })
    ],
  });
  if (!returnedCollection) {
    return false;
  }
  const collection = weaviateClient.collections.get('CodeFile');
  const flattened = documents.flatMap((doc) => doc.chunks.map((chunk, index) => ({ file_path: doc.path, content: chunk, chunk_index: index })));
  const result = await collection.data.insertMany(flattened);
  console.log('Insertion response: ', result);

  return await collection.query.hybrid("Settings");
}

export async function hybridSearch(query: string) {
  "use server";
  const weaviateClient: WeaviateClient = await weaviate.connectToLocal({
    host: 'weaviate',
    port: 8080
  });
  const isReady = await weaviateClient.isReady();
  if (!isReady) {
    throw new Error('Weaviate is not ready');
  }
  const collection = weaviateClient.collections.get('CodeFile');
  const generatePrompt = `
    You are an expert in software development.
    Your goal is to guide the user in understanding the code.
    You will provide relevant files, functions, classes and code snippets that help the user understand the code.
    Do not try to solve the problem, just give the user the information they need.
    Use markdown format.
  `
  const result = await collection.generate.hybrid(query,
    { groupedTask: generatePrompt },
    { limit: 10 }
  );
  return result;
}
