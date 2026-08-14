import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('gitDesk', {
  selectRepository: () => ipcRenderer.invoke('repo:select'),
  getLastRepository: () => ipcRenderer.invoke('repo:last'),
  getSnapshot: (repoPath: string) => ipcRenderer.invoke('repo:snapshot', repoPath),
  getCommitDetails: (repoPath: string, commitHash: string) => ipcRenderer.invoke('repo:commitDetails', repoPath, commitHash),
  commitFiles: (repoPath: string, filePaths: string[], message: string) =>
    ipcRenderer.invoke('repo:commitFiles', repoPath, filePaths, message),
  stageFiles: (repoPath: string, filePaths: string[]) =>
    ipcRenderer.invoke('repo:stageFiles', repoPath, filePaths),
  unstageFiles: (repoPath: string, filePaths: string[]) =>
    ipcRenderer.invoke('repo:unstageFiles', repoPath, filePaths),
  pull: (repoPath: string) => ipcRenderer.invoke('repo:pull', repoPath),
  push: (repoPath: string) => ipcRenderer.invoke('repo:push', repoPath),
  connectRemote: (repoPath: string, remoteUrl: string) => ipcRenderer.invoke('repo:connectRemote', repoPath, remoteUrl),
  checkout: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:checkout', repoPath, branch),
  createBranch: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:createBranch', repoPath, branch),
  createAndCheckoutBranch: (repoPath: string, branch: string) =>
    ipcRenderer.invoke('repo:createAndCheckoutBranch', repoPath, branch),
  merge: (repoPath: string, branch: string) => ipcRenderer.invoke('repo:merge', repoPath, branch),
  cherryPick: (repoPath: string, commitHash: string) => ipcRenderer.invoke('repo:cherryPick', repoPath, commitHash),
  deleteLocalBranch: (repoPath: string, branch: string, force: boolean) =>
    ipcRenderer.invoke('repo:deleteLocalBranch', repoPath, branch, force),
  onRepositoryChanged: (callback: (repoPath: string) => void) => {
    const listener = (_event: IpcRendererEvent, repoPath: string) => callback(repoPath)
    ipcRenderer.on('repo:changed', listener)
    return () => ipcRenderer.removeListener('repo:changed', listener)
  },
  onRepositoryWatchError: (callback: (message: string) => void) => {
    const listener = (_event: IpcRendererEvent, message: string) => callback(message)
    ipcRenderer.on('repo:watchError', listener)
    return () => ipcRenderer.removeListener('repo:watchError', listener)
  },
})
