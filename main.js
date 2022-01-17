// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

let timer

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    // transparent: true,
    // width: 800,
    // height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let mainWindow = createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })

  function drink(){
    if(timer) clearInterval(timer)
    timer = setInterval(() => {
      mainWindow.minimize()
      work()
    }, 20*1000)
  }
  
  function work(){
    if(timer) clearInterval(timer)
    timer = setInterval(() => {
      mainWindow.show()
      // mainWindow.maximize()
      drink()
    }, 30*60*1000)
  }

  // initial state
  drink()

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
    if(timer) clearInterval(timer)
    work()
  })

  // shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      event.preventDefault()
      mainWindow.setFullScreen(false)
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
