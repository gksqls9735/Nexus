export type BranchCreateModalState = {
  mode: 'create' | 'createAndCheckout'
} | null

export type BranchDeleteModalState = {
  branch: string
  force: boolean
} | null

export type RemoteConnectModalState = {
  remoteUrl: string
} | null
