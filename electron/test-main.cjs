const { app, BrowserWindow } = require('electron')

function createWindow() {
  console.log('Creating window...')
  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  console.log('Window created, loading URL...')
  
  // Load a simple page
  mainWindow.loadURL('data:text/html,<h1>Hello from Electron!</h1><p>If you can see this, Electron is working!</p>')
  
  console.log('URL loaded')
}

app.whenReady().then(() => {
  console.log('App ready, creating window...')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
