import { electronAPI } from '@electron-toolkit/preload'
import remote from '@electron/remote'
import { contextBridge } from 'electron'

// Defina uma interface para tipar o objeto 'api'
interface MyCustomAPI {
  closeWindow: () => void
  pin: (status: boolean) => void
  setPosition: (x: number, y: number) => void
  getPosition: () => number[]
  appVersion: string
}

const currentWindow = remote.getCurrentWindow()
// Custom APIs for renderer
const api: MyCustomAPI = {
  closeWindow: () => currentWindow.close(),
  pin: (status: boolean) => currentWindow.setAlwaysOnTop(status),
  setPosition: (x: number, y: number) => currentWindow.setPosition(x, y),
  getPosition: () => currentWindow.getPosition(),
  appVersion: remote.app.getVersion()
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
