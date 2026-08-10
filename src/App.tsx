import { GitBranch, GitMerge, Pickaxe, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { MouseEvent } from 'react'
import { AppToolbar } from './components/AppToolbar'
import { BranchCreateModal } from './components/BranchCreateModal'
import { BranchDeleteModal } from './components/BranchDeleteModal'
import { ChangedFiles } from './components/ChangedFiles'
import { CommitDetails } from './components/CommitDetails'
import { ContextMenu } from './components/ContextMenu'
import { GitHistory } from './components/GitHistory'
import { RemoteConnectModal } from './components/RemoteConnectModal'
import { RepositorySidebar } from './components/RepositorySidebar'
import {
  checkout,
  cherryPick,
  connectRemote,
  createAndCheckoutBranch,
  createBranch,
  deleteLocalBranch,
  emptySnapshot,
  getSnapshot,
  merge,
  pull,
  push,
  selectRepository,
} from './services/gitElectronService'
import type { ContextMenuItem, ContextMenuState } from './types/contextMenu'
import type { GitAction, GitHistoryItem, RepoSnapshot } from './types/git'
import type { BranchCreateModalState, BranchDeleteModalState, RemoteConnectModalState } from './types/modal'

function App() {
  const [snapshot, setSnapshot] = useState<RepoSnapshot>(emptySnapshot)
  const [selectedCommit, setSelectedCommit] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busyAction, setBusyAction] = useState<GitAction | 'select' | 'refresh' | ''>('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [branchCreateModal, setBranchCreateModal] = useState<BranchCreateModalState>(null)
  const [branchDeleteModal, setBranchDeleteModal] = useState<BranchDeleteModalState>(null)
  const [remoteConnectModal, setRemoteConnectModal] = useState<RemoteConnectModalState>(null)
  const selectedCommitDetail = snapshot.history.find((commit) => commit.hash === selectedCommit)

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  async function refresh() {
    if (!snapshot.repoPath) return
    await runWithBusyState('refresh', async () => {
      applySnapshot(await getSnapshot())
    })
  }

  async function handleSelectRepository() {
    await runWithBusyState('select', async () => {
      const repoPath = await selectRepository()
      if (!repoPath) return
      applySnapshot(await getSnapshot())
      setMessage('저장소를 불러왔습니다.')
    })
  }

  async function runAction(action: GitAction, task: () => Promise<void>) {
    if (!snapshot.repoPath) return
    await runWithBusyState(action, async () => {
      await task()
      applySnapshot(await getSnapshot())
      setMessage('작업이 완료되었습니다.')
    })
  }

  async function runWithBusyState(action: GitAction | 'select' | 'refresh', task: () => Promise<void>) {
    setBusyAction(action)
    setError('')
    setMessage('')
    try {
      await task()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setBusyAction('')
    }
  }

  function applySnapshot(nextSnapshot: RepoSnapshot) {
    setSnapshot(nextSnapshot)
  }

  function handleSelectCommit(commitHash: string) {
    setSelectedCommit(commitHash)
  }

  function openCommitMenu(event: MouseEvent, commit: GitHistoryItem) {
    event.preventDefault()
    event.stopPropagation()
    handleSelectCommit(commit.hash)
    openContextMenu(event, [
      {
        id: 'cherry-pick',
        label: `Cherry-pick ${commit.hash.slice(0, 8)}`,
        icon: <Pickaxe size={15} />,
        onSelect: () => void runAction('cherryPick', () => cherryPick(commit.hash)),
      },
    ])
  }

  function openBranchMenu(event: MouseEvent, branch: string) {
    event.preventDefault()
    event.stopPropagation()
    const isCurrent = branch === snapshot.currentBranch
    const isRemote = branch.includes('/')
    const items: ContextMenuItem[] = [
      {
        id: 'checkout',
        label: `Checkout ${branch}`,
        icon: <GitBranch size={15} />,
        disabled: isCurrent,
        onSelect: () => void runAction('checkout', () => checkout(branch)),
      },
      {
        id: 'merge',
        label: `Merge ${branch} into ${snapshot.currentBranch}`,
        icon: <GitMerge size={15} />,
        disabled: isCurrent,
        onSelect: () => void runAction('merge', () => merge(branch)),
      },
      {
        id: 'delete',
        label: `Delete ${branch}`,
        icon: <Trash2 size={15} />,
        danger: true,
        disabled: isCurrent || isRemote,
        onSelect: () => setBranchDeleteModal({ branch, force: false }),
      },
      {
        id: 'force-delete',
        label: `Force delete ${branch}`,
        icon: <Trash2 size={15} />,
        danger: true,
        disabled: isCurrent || isRemote,
        onSelect: () => setBranchDeleteModal({ branch, force: true }),
      },
    ]
    openContextMenu(event, items)
  }

  function openLocalBranchHeaderMenu(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    openContextMenu(event, [
      {
        id: 'create-branch',
        label: 'Create branch',
        icon: <GitBranch size={15} />,
        onSelect: () => setBranchCreateModal({ mode: 'create' }),
      },
      {
        id: 'create-checkout-branch',
        label: 'Create branch and checkout',
        icon: <GitBranch size={15} />,
        onSelect: () => setBranchCreateModal({ mode: 'createAndCheckout' }),
      },
    ])
  }

  function submitBranchCreate(branchName: string, checkoutAfterCreate: boolean) {
    setBranchCreateModal(null)
    const action = checkoutAfterCreate ? 'createAndCheckoutBranch' : 'createBranch'
    const task = checkoutAfterCreate
      ? () => createAndCheckoutBranch(branchName)
      : () => createBranch(branchName)

    void runAction(action, task)
  }

  function checkoutLocalBranch(branch: string) {
    if (branch === snapshot.currentBranch) {
      return
    }

    void runAction('checkout', () => checkout(branch))
  }

  function confirmDeleteBranch(branch: string, force: boolean) {
    setBranchDeleteModal(null)
    void runAction('deleteBranch', () => deleteLocalBranch(branch, force))
  }

  function submitRemoteConnect(remoteUrl: string) {
    setRemoteConnectModal(null)
    void runAction('connectRemote', () => connectRemote(remoteUrl))
  }

  function openContextMenu(event: MouseEvent, items: ContextMenuItem[]) {
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 240),
      y: Math.min(event.clientY, window.innerHeight - 180),
      items,
    })
  }

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-slate-100 text-slate-950">
      <AppToolbar
        snapshot={snapshot}
        busyAction={busyAction}
        onSelectRepository={handleSelectRepository}
        onRefresh={() => void refresh()}
        onConnectRemote={() => setRemoteConnectModal({ remoteUrl: snapshot.remoteUrl })}
        onPull={() => void runAction('pull', pull)}
        onPush={() => void runAction('push', push)}
      />

      <div className="flex min-h-0 flex-1">
        <RepositorySidebar
          snapshot={snapshot}
          onBranchContextMenu={openBranchMenu}
          onLocalBranchDoubleClick={checkoutLocalBranch}
          onLocalBranchMenuClick={openLocalBranchHeaderMenu}
        />

        <section className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_260px] gap-3 overflow-hidden p-3">
          <GitHistory
            commits={snapshot.history}
            selectedCommit={selectedCommit}
            onSelectCommit={handleSelectCommit}
            onCommitContextMenu={openCommitMenu}
          />
          <div className="grid min-h-0 grid-cols-[1fr_360px] gap-3">
            <CommitDetails commit={selectedCommitDetail} message={message} error={error} />
            <ChangedFiles files={snapshot.changedFiles} />
          </div>
        </section>
      </div>

      <ContextMenu menu={contextMenu} onClose={closeContextMenu} />
      <BranchCreateModal
        modal={branchCreateModal}
        onClose={() => setBranchCreateModal(null)}
        onSubmit={submitBranchCreate}
      />
      <BranchDeleteModal
        modal={branchDeleteModal}
        onClose={() => setBranchDeleteModal(null)}
        onConfirm={confirmDeleteBranch}
      />
      <RemoteConnectModal
        modal={remoteConnectModal}
        onClose={() => setRemoteConnectModal(null)}
        onSubmit={submitRemoteConnect}
      />
    </main>
  )
}

function getErrorMessage(caught: unknown) {
  if (caught instanceof Error) return caught.message
  return String(caught)
}

export default App
