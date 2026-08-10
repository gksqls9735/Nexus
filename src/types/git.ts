export type GitHistoryItem = {
  hash: string
  message: string
  author: string
  date: string
  syncStatus: 'synced' | 'unpushed'
}

export type ChangedFile = {
  path: string
  index: string
  workingTree: string
}

export type CommitChangedFile = {
  path: string
  status: string
}

export type CommitDetailsData = {
  hash: string
  message: string
  files: CommitChangedFile[]
}

export type RepoSnapshot = {
  repoPath: string
  currentBranch: string
  remoteUrl: string
  ahead: number
  behind: number
  isClean: boolean
  localBranches: string[]
  remoteBranches: string[]
  history: GitHistoryItem[]
  changedFiles: ChangedFile[]
}

export type GitAction =
  | 'pull'
  | 'push'
  | 'checkout'
  | 'merge'
  | 'cherryPick'
  | 'deleteBranch'
  | 'createBranch'
  | 'createAndCheckoutBranch'
  | 'connectRemote'
