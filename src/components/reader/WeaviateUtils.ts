"use server";

import weaviate, { dataType, WeaviateClient } from 'weaviate-client';



export async function importFiles(files: object[]) {
    "use server";
    console.log('importing files');
    const weaviateClient: WeaviateClient = await weaviate.connectToLocal({
        host: 'localhost',
        port: 8080
    });
    // const isReady = await weaviateClient.isReady();
    // if (!isReady) {
    //     throw new Error('Weaviate is not ready');
    // }

    if (await weaviateClient.collections.exists('code_file')) {
        await weaviateClient.collections.delete('code_file');
    }

    const returnedCollection = await weaviateClient.collections.create({
        name: 'code_file',
        properties: [
            {
                name: 'path',
                dataType: dataType.TEXT,
            },
            {
                name: 'content',
                dataType: dataType.TEXT,
            },
        ],
    });
    if (!returnedCollection) {
        return false;
    }
    console.log(files);

    const collection = weaviateClient.collections.get('code_file');

    console.log(collection);


    const result = await collection.data.insertMany(files);
    console.log('Insertion response: ', result);
    console.log('fetchObjects: ', await collection.query.fetchObjects({ limit: 10 }));
}
