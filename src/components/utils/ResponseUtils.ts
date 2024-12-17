
export function parseReferences(chunk: string) {
    const refRegex = /<ref>(.*?)<\/ref>/g;

    const result: ({ type: "text" | "ref", content: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = refRegex.exec(chunk)) !== null) {
        if (lastIndex < match.index) {
            result.push({
                type: "text",
                content: chunk.slice(lastIndex, match.index),
            });
        }

        const filepath = match[1];
        result.push({
            type: "ref",
            content: filepath,
        });

        lastIndex = refRegex.lastIndex;
    }

    if (lastIndex < chunk.length) {
        result.push({
            type: "text",
            content: chunk.slice(lastIndex),
        });
    }

    return result;
}