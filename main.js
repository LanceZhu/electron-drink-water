const {app, BrowserWindow, Tray, nativeImage, ipcMain, Menu} = require('electron')
const path = require('path')

let timer
let tray
let fullscreenFlag = true

function createWindow () {
  const mainWindow = new BrowserWindow({
    titleBarOverlay: fullscreenFlag,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  return mainWindow
}

app.whenReady().then(() => {
  let mainWindow = createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })

  Menu.setApplicationMenu(null)

  function drink(){
    if(timer) clearInterval(timer)
    timer = setInterval(() => {
      mainWindow.hide()
      work()
    }, 20*1000)
  }
  
  function work(){
    if(timer) clearInterval(timer)
    timer = setInterval(() => {
      mainWindow.show()
      // drink()
    }, 30*60*1000)
  }

  // initial state
  // drink()

  ipcMain.on('hide-window', () => {
    mainWindow.hide()
    if(timer) clearInterval(timer)
    work()
  })

  // shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control & input.key.toLowerCase() === 'f') {
      event.preventDefault()
      fullscreenFlag = !fullscreenFlag
      mainWindow.setFullScreen(fullscreenFlag)
    } else if (input.control & input.key.toLowerCase() === 'f') {
      event.preventDefault()
      app.isQuiting = true
      app.quit()
    }
  })

  // tray area
  const icon = nativeImage.createFromPath(path.join(__dirname, 'resources', 'logo.png'))
  tray = new Tray(icon)
  let contextMenu = Menu.buildFromTemplate([{ 
        label: 'Quit',
        click:  function(){
          app.isQuiting = true
          app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)

  // mainWindow.on('minimize',function(event){
  //   event.preventDefault()
  //   mainWindow.hide()
  // })

  mainWindow.on('close', function (event) {
      if(!app.isQuiting){
          event.preventDefault()
          mainWindow.hide()
      }

      return false
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
