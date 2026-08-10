import type { CommitDetailsData, RepoSnapshot } from '../types/git'

export type GitDeskApi = {
  selectRepository: () => Promise<string>
  getSnapshot: (repoPath: string) => Promise<RepoSnapshot>
  getCommitDetails: (repoPath: string, commitHash: string) => Promise<CommitDetailsData>
  pull: (repoPath: string) => Promise<void>
  push: (repoPath: string) => Promise<void>
  connectRemote: (repoPath: string, remoteUrl: string) => Promise<void>
  checkout: (repoPath: string, branch: string) => Promise<void>
  createBranch: (repoPath: string, branch: string) => Promise<void>
  createAndCheckoutBranch: (repoPath: string, branch: string) => Promise<void>
  merge: (repoPath: string, branch: string) => Promise<void>
  cherryPick: (repoPath: string, commitHash: string) => Promise<void>
  deleteLocalBranch: (repoPath: string, branch: string, force: boolean) => Promise<void>
  onRepositoryChanged: (callback: (repoPath: string) => void) => () => void
  onRepositoryWatchError: (callback: (message: string) => void) => () => void
}

let activeRepoPath = ''

export const emptySnapshot: RepoSnapshot = {
  repoPath: '',
  currentBranch: '',
  remoteUrl: '',
  ahead: 0,
  behind: 0,
  isClean: true,
  localBranches: [],
  remoteBranches: [],
  history: [],
  changedFiles: [],
}

export async function selectRepository() {
  const repoPath = await getApi().selectRepository()
  activeRepoPath = repoPath
  return repoPath
}

export async function getSnapshot() {
  return getApi().getSnapshot(activeRepoPath)
}

export async function getCommitDetails(commitHash: string) {
  return getApi().getCommitDetails(activeRepoPath, commitHash)
}

export async function pull() {
  await getApi().pull(activeRepoPath)
}

export async function push() {
  await getApi().push(activeRepoPath)
}

export async function connectRemote(remoteUrl: string) {
  await getApi().connectRemote(activeRepoPath, remoteUrl)
}

export async function checkout(branch: string) {
  await getApi().checkout(activeRepoPath, branch)
}

export async function createBranch(branch: string) {
  await getApi().createBranch(activeRepoPath, branch)
}

export async function createAndCheckoutBranch(branch: string) {
  await getApi().createAndCheckoutBranch(activeRepoPath, branch)
}

export async function merge(branch: string) {
  await getApi().merge(activeRepoPath, branch)
}

export async function cherryPick(commitHash: string) {
  await getApi().cherryPick(activeRepoPath, commitHash)
}

export async function deleteLocalBranch(branch: string, force: boolean) {
  await getApi().deleteLocalBranch(activeRepoPath, branch, force)
}

export function onRepositoryChanged(callback: (repoPath: string) => void) {
  return getApi().onRepositoryChanged(callback)
}

export function onRepositoryWatchError(callback: (message: string) => void) {
  return getApi().onRepositoryWatchError(callback)
}

function getApi() {
  if (!window.gitDesk) {
    throw new Error('Electron 환경에서 앱을 실행해야 로컬 Git 저장소를 조작할 수 있습니다.')
  }
  return window.gitDesk
}
