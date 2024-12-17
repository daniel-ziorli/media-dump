import { RepoTree } from "@/stores/RepoStore";

export function flattenRepoTree(repoTree: RepoTree): { path: string, content: string }[] {
  const files: { path: string, content: string }[] = [];

  function recursiveFlatten(currentPath: string, tree: RepoTree) {
    for (const child of tree.children || []) {
      if (child.type === 'file') {
        files.push({ path: `${currentPath}/${child.name}`, content: child.content || '' });
      } else {
        recursiveFlatten(`${tree.name}/${child.name}`, child);
      }
    }
  }

  recursiveFlatten('', repoTree);
  return files;
}

export function getFilesByName(repoTree: RepoTree, name: string): RepoTree[] {
  const files: RepoTree[] = [];

  function recursiveSearch(currentPath: string, tree: RepoTree) {
    for (const child of tree.children || []) {
      if (child.type === 'file' && child.name.toLowerCase() === name.toLowerCase()) {
        files.push(child);
      } else if (child.type === 'folder') {
        recursiveSearch(`${currentPath}/${child.name}`, child);
      }
    }
  }

  recursiveSearch('', repoTree);
  return files;
}

export function removeContentFieldsFromTree(repoTree: RepoTree): RepoTree {
  const cleanTree = JSON.parse(JSON.stringify(repoTree));

  function recursiveRemoveContent(currentTree: RepoTree) {
    for (const child of currentTree.children || []) {
      if (child.type === 'file') {
        delete child.content;
      } else {
        recursiveRemoveContent(child);
      }
    }
  }

  recursiveRemoveContent(cleanTree);
  return cleanTree;
}
