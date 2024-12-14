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
