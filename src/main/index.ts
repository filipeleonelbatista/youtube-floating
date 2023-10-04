import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import remote from '@electron/remote/main'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path, { join } from 'path'

function createWindow(): void {
  remote.initialize()

  const frame = false
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 400,
    minHeight: 225 + (frame ? 30 : 0),
    width: 400,
    height: 225 + (frame ? 30 : 0),
    show: false,
    frame: frame,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    transparent: true, // Tornar a janela transparente
    backgroundColor: '#00000000', // Cor de fundo transparente (RGBA)
    alwaysOnTop: false
  })

  remote.enable(mainWindow.webContents)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Ouvinte de evento para receber mensagens de movimentação da janela
  ipcMain.on('move-window', (_event, { x, y }) => {
    if (mainWindow) {
      mainWindow.setPosition(x, y)
    }
  })

  ipcMain.on('get-window-position', (event) => {
    if (mainWindow) {
      event.returnValue = mainWindow.getPosition()
    }
  })

  // Evento para manter o aspect ratio 16:9 ao redimensionar
  mainWindow.on('resize', () => {
    const [width, _height] = mainWindow.getSize()
    const aspectRatio = 16 / 9 // Proporção desejada (16:9)
    const margin = frame ? 30 : 0

    // Calcule a nova altura com base na largura atual e na proporção
    const newHeight = Math.round(width / aspectRatio) + margin

    // Defina a nova altura, mantendo a largura inalterada
    mainWindow.setSize(width, newHeight)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
