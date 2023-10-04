import { ElectronAPI } from '@electron-toolkit/preload'

interface MyCustomAPI {
  closeWindow: () => void
  pin: (status: boolean) => void
  setPosition: (x: number, y: number) => void
  getPosition: () => number[]
  appVersion: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: MyCustomAPI
  }
}
