"use server";

import { IChunk } from '@/stores/RepoStore';
import weaviate, { dataType, WeaviateClient } from 'weaviate-client';



export async function importDocuments(documents: { file_name: string, file_path: string, chunks: IChunk[] }[]) {
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
        name: 'file_name',
        dataType: dataType.TEXT,
      },
      {
        name: 'file_path',
        dataType: dataType.TEXT,
      },
      {
        name: 'content',
        dataType: dataType.TEXT,
      },

      {
        name: 'tags',
        dataType: dataType.TEXT_ARRAY,
      },
      {
        name: "start_line",
        dataType: dataType.INT,
      },
      {
        name: "end_line",
        dataType: dataType.INT,
      }
    ],
  });
  if (!returnedCollection) {
    return false;
  }
  const collection = weaviateClient.collections.get('CodeFile');
  const flattened = documents.flatMap((doc) =>
    doc.chunks.map((chunk, index) => ({
      file_name: doc.file_name,
      file_path: doc.file_path,
      content: chunk.content,
      tags: chunk.tags,
      start_line: chunk.start_line,
      end_line: chunk.end_line
    }))
  );
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
  const result = await collection.query.hybrid(query,
    { limit: 10 }
  );
  return result;
}
