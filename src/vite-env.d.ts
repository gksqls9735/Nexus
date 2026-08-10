/// <reference types="vite/client" />

import type { GitDeskApi } from './services/gitElectronService'

declare global {
  interface Window {
    gitDesk?: GitDeskApi
  }
}
