import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { simpleGit } from 'simple-git'
import type { OpenDialogOptions } from 'electron'
import type { SimpleGit } from 'simple-git'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null
let repositoryWatcher: fs.FSWatcher | null = null
let repositoryWatchPath = ''
let repositoryWatchTimeout: NodeJS.Timeout | null = null
let repositoryPollInterval: NodeJS.Timeout | null = null
let repositoryStateSignature = ''
let repositoryPollRunning = false
const preferencesFileName = 'preferences.json'

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    title: 'Local Git Desk',
    backgroundColor: '#f1f5f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    return
  }

  await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(async () => {
  registerGitHandlers()
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopRepositoryWatch()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopRepositoryWatch()
})

function registerGitHandlers() {
  ipcMain.handle('repo:select', async () => {
    const dialogOptions: OpenDialogOptions = {
      title: '로컬 Git 저장소 선택',
      properties: ['openDirectory'],
    }
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions)

    if (result.canceled || result.filePaths.length === 0) {
      return ''
    }

    const repoPath = result.filePaths[0]
    await ensureGitRepo(repoPath)
    saveLastRepositoryPath(repoPath)
    startRepositoryWatch(repoPath)
    return repoPath
  })

  ipcMain.handle('repo:last', async () => {
    const repoPath = readLastRepositoryPath()
    if (!repoPath) {
      return ''
    }

    try {
      await ensureGitRepo(repoPath)
      startRepositoryWatch(repoPath)
      return repoPath
    } catch {
      saveLastRepositoryPath('')
      return ''
    }
  })
  ipcMain.handle('repo:snapshot', async (_event, repoPath: string) => getSnapshot(repoPath))
  ipcMain.handle('repo:commitDetails', async (_event, repoPath: string, commitHash: string) =>
    getCommitDetails(repoPath, commitHash),
  )
  ipcMain.handle('repo:commitFiles', async (_event, repoPath: string, filePaths: string[], message: string) => {
    await commitFiles(repoPath, filePaths, message)
  })
  ipcMain.handle('repo:stageFiles', async (_evnet, repoPath: string, filePaths: string[]) => {
    await stageFiles(repoPath, filePaths)
  })
  ipcMain.handle('repo:unstageFiles', async (_event, repoPath: string, filePaths: string[]) => {
    await unstageFiles(repoPath, filePaths)
  })
  ipcMain.handle('repo:pull', async (_event, repoPath: string) => {
    await getGit(repoPath).pull()
  })
  ipcMain.handle('repo:push', async (_event, repoPath: string) => {
    await getGit(repoPath).push()
  })
  ipcMain.handle('repo:connectRemote', async (_event, repoPath: string, remoteUrl: string) => {
    const git = getGit(repoPath)
    const remotes = await git.getRemotes(true)
    const hasOrigin = remotes.some((remote) => remote.name === 'origin')

    if (hasOrigin) {
      await git.raw(['remote', 'set-url', 'origin', remoteUrl])
      return
    }

    await git.addRemote('origin', remoteUrl)
  })
  ipcMain.handle('repo:checkout', async (_event, repoPath: string, branch: string) => {
    await getGit(repoPath).checkout(branch)
  })
  ipcMain.handle('repo:createBranch', async (_event, repoPath: string, branch: string) => {
    await getGit(repoPath).branch([branch])
  })
  ipcMain.handle('repo:createAndCheckoutBranch', async (_event, repoPath: string, branch: string) => {
    await getGit(repoPath).checkoutLocalBranch(branch)
  })
  ipcMain.handle('repo:merge', async (_event, repoPath: string, branch: string) => {
    await getGit(repoPath).merge([branch])
  })
  ipcMain.handle('repo:cherryPick', async (_event, repoPath: string, commitHash: string) => {
    await getGit(repoPath).raw(['cherry-pick', commitHash])
  })
  ipcMain.handle('repo:deleteLocalBranch', async (_event, repoPath: string, branch: string, force: boolean) => {
    await getGit(repoPath).branch([force ? '-D' : '-d', branch])
  })
}

function startRepositoryWatch(repoPath: string) {
  if (repositoryWatchPath === repoPath && repositoryWatcher) {
    return
  }

  stopRepositoryWatch()
  repositoryWatchPath = repoPath

  try {
    repositoryWatcher = fs.watch(repoPath, { recursive: true }, (_eventType, filename) => {
      if (shouldIgnoreWatchEvent(filename?.toString() ?? '')) {
        return
      }

      scheduleRepositoryChanged(repoPath)
    })
  } catch (caught) {
    mainWindow?.webContents.send('repo:watchError', getErrorMessage(caught))
  }

  startRepositoryPolling(repoPath)
}

function stopRepositoryWatch() {
  repositoryWatcher?.close()
  repositoryWatcher = null
  repositoryWatchPath = ''

  if (repositoryWatchTimeout) {
    clearTimeout(repositoryWatchTimeout)
    repositoryWatchTimeout = null
  }

  if (repositoryPollInterval) {
    clearInterval(repositoryPollInterval)
    repositoryPollInterval = null
  }

  repositoryStateSignature = ''
  repositoryPollRunning = false
}

function scheduleRepositoryChanged(repoPath: string) {
  if (repositoryWatchTimeout) {
    clearTimeout(repositoryWatchTimeout)
  }

  repositoryWatchTimeout = setTimeout(() => {
    void notifyRepositoryChanged(repoPath)
  }, 650)
}

async function notifyRepositoryChanged(repoPath: string) {
  try {
    await updateRepositoryStateSignature(repoPath)
  } catch {
    // A refresh is still useful even if signature update fails momentarily.
  }

  mainWindow?.webContents.send('repo:changed', repoPath)
}

function shouldIgnoreWatchEvent(filename: string) {
  const normalized = filename.replaceAll('\\', '/')
  const ignoredSegments = ['/node_modules/', 'node_modules/', '/dist/', 'dist/', '/dist-electron/', 'dist-electron/', '/release/', 'release/']

  if (ignoredSegments.some((segment) => normalized.includes(segment))) {
    return true
  }

  return normalized.startsWith('.git/objects/')
}

function startRepositoryPolling(repoPath: string) {
  void updateRepositoryStateSignature(repoPath)

  repositoryPollInterval = setInterval(() => {
    void detectRepositoryStateChange(repoPath)
  }, 2500)
}

async function updateRepositoryStateSignature(repoPath: string) {
  repositoryStateSignature = await getRepositoryStateSignature(repoPath)
}

async function detectRepositoryStateChange(repoPath: string) {
  if (repositoryPollRunning) {
    return
  }

  repositoryPollRunning = true
  try {
    const nextSignature = await getRepositoryStateSignature(repoPath)
    if (repositoryStateSignature && nextSignature !== repositoryStateSignature) {
      repositoryStateSignature = nextSignature
      scheduleRepositoryChanged(repoPath)
      return
    }

    repositoryStateSignature = nextSignature
  } catch (caught) {
    mainWindow?.webContents.send('repo:watchError', getErrorMessage(caught))
  } finally {
    repositoryPollRunning = false
  }
}

async function getRepositoryStateSignature(repoPath: string) {
  const git = getGit(repoPath)
  const [head, status] = await Promise.all([
    git.raw(['rev-parse', 'HEAD']).catch(() => ''),
    git.raw(['status', '--porcelain=v1', '--branch']),
  ])

  return `${head.trim()}\n${status.trim()}`
}

async function getCommitDetails(repoPath: string, commitHash: string) {
  const git = getGit(repoPath);
  const output = await git.raw([
    'show',
    '--name-status',
    '--format=format:%B%x1e',
    commitHash,
  ])
  const [messagePart = '', filesPart = ''] = output.split('\x1e')
  const files = parseCommitFiles(filesPart);

  return {
    hash: commitHash,
    message: messagePart.trim(),
    files: await Promise.all(
      files.map(async (file) => ({
        ...file,
        patch: await git.raw([
          'show',
          '--format=format:',
          commitHash,
          '--',
          file.path
        ]),
      })),
    ),
  }
}

async function commitFiles(repoPath: string, filePaths: string[], message: string) {
  const trimmedMessage = message.trim();
  const normalizedFilePaths = normalizeCommitFilePaths(filePaths);

  if (!trimmedMessage) throw new Error('커밋 메세지를 입력하세요.');
  if (normalizedFilePaths.length === 0) throw new Error('커밋할 파일을 선택하세요.');

  const git = getGit(repoPath)
  await git.raw(['add', '-A', '--', ...normalizedFilePaths])
  await git.raw(['commit', '-m', trimmedMessage])
}

function normalizeCommitFilePaths(filePaths: string[]) {
  return Array.from(
    new Set(
      filePaths
        .map((filePath) => filePath.trim().replaceAll('\\', '/'))
        .filter((filePath) => filePath && !path.isAbsolute(filePath) && !filePath.includes('\0')),
    ),
  )
}

async function stageFiles(repoPath: string, filePaths: string[]) {
  const normalizedFilePaths = normalizeCommitFilePaths(filePaths);

  if (normalizedFilePaths.length === 0) throw new Error('stage에 올릴 파일을 선택하세요.');

  await getGit(repoPath).raw(['add', '-A', '--', ...normalizedFilePaths]);
}

async function unstageFiles(repoPath: string, filePaths: string[]) {
  const normalizedFilePaths = normalizeCommitFilePaths(filePaths);

  if (normalizedFilePaths.length === 0) throw new Error('unstage할 파일을 선택하세요.');

  await getGit(repoPath).raw(['restore', '--staged', '--', ...normalizedFilePaths]);
}

function parseCommitFiles(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split('\t')
      return {
        status,
        path: paths.join(' -> '),
      }
    })
    .filter((file) => file.path)
}

async function getSnapshot(repoPath: string) {
  const git = getGit(repoPath)
  await ensureGitRepo(repoPath)

  const [status, localBranches, remoteBranches, remotes, log] = await Promise.all([
    git.status(),
    git.branchLocal(),
    git.branch(['-r']),
    git.getRemotes(true),
    git.log({ maxCount: 40 }),
  ])
  const unpushedHashes = await getUnpushedHashes(git)

  return {
    repoPath,
    currentBranch: status.current || localBranches.current || '',
    remoteUrl: getPrimaryRemoteUrl(remotes),
    ahead: status.ahead,
    behind: status.behind,
    isClean: status.isClean(),
    localBranches: localBranches.all,
    remoteBranches: remoteBranches.all.filter((branch) => !branch.includes('HEAD ->')),
    history: log.all.map((commit) => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
      syncStatus: unpushedHashes.has(commit.hash) ? 'unpushed' : 'synced',
    })),
    changedFiles: status.files.map((file) => ({
      path: file.path,
      index: file.index,
      workingTree: file.working_dir,
    })),
  }
}

async function getUnpushedHashes(git: SimpleGit) {
  try {
    const output = await git.raw(['log', '--format=%H', '@{u}..HEAD'])
    return new Set(output.split(/\r?\n/).filter(Boolean))
  } catch {
    return new Set<string>()
  }
}

async function ensureGitRepo(repoPath: string) {
  const isRepo = await getGit(repoPath).checkIsRepo()
  if (!isRepo) {
    throw new Error('선택한 폴더는 Git 저장소가 아닙니다.')
  }
}

function getGit(repoPath: string): SimpleGit {
  if (!repoPath) {
    throw new Error('먼저 로컬 Git 저장소를 선택하세요.')
  }

  return simpleGit({
    baseDir: repoPath,
    binary: 'git',
    maxConcurrentProcesses: 1,
    trimmed: false,
  })
}

function getPrimaryRemoteUrl(remotes: Array<{ name: string; refs: { fetch: string; push: string } }>) {
  const origin = remotes.find((remote) => remote.name === 'origin')
  const remote = origin ?? remotes[0]
  return remote?.refs.fetch || remote?.refs.push || ''
}

function readLastRepositoryPath() {
  try {
    const preferences = JSON.parse(fs.readFileSync(getPreferencesFilePath(), 'utf8')) as { lastRepositoryPath?: string }
    return preferences.lastRepositoryPath || ''
  } catch {
    return ''
  }
}

function saveLastRepositoryPath(repoPath: string) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true })
  fs.writeFileSync(
    getPreferencesFilePath(),
    JSON.stringify({ lastRepositoryPath: repoPath }, null, 2),
    'utf8',
  )
}

function getPreferencesFilePath() {
  return path.join(app.getPath('userData'), preferencesFileName)
}

function getErrorMessage(caught: unknown) {
  if (caught instanceof Error) return caught.message
  return String(caught)
}
