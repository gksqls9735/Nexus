import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('gitDesk', {
  selectRepository: () => ipcRenderer.invoke('repo:select'),
  getSnapshot: (repoPath: string) => ipcRenderer.invoke('repo:snapshot', repoPath),
  pull: (repoPath: string) => ipcRenderer.invoke('repo:pull', repoPath),
  push: (repoPath: string) => ipcRenderer.invoke('repo:push', repoPath),
  checkout: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:checkout', repoPath, branch),
  createBranch: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:createBranch', repoPath, branch),
  createAndCheckoutBranch: (repoPath: string, branch: string) =>
    ipcRenderer.invoke('repo:createAndCheckoutBranch', repoPath, branch),
  merge: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:merge', repoPath, branch),
  cherryPick: (repoPath: string, commitHash: string) => ipcRenderer.invoke('repo:cherryPick', repoPath, commitHash),
  deleteLocalBranch: (repoPath: string, branch: string, force: boolean) =>
    ipcRenderer.invoke('repo:deleteLocalBranch', repoPath, branch, force),
})
