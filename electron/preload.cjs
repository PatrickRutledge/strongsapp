const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // You can add specific API methods here as needed
  // For example, if you want to communicate between renderer and main process
  
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  
  // Example: if you want to send messages to main process
  // sendMessage: (message) => ipcRenderer.invoke('message', message),
  
  // Example: if you want to listen for messages from main process
  // onMessage: (callback) => ipcRenderer.on('message', callback)
});

// For debugging in development
if (process.env.NODE_ENV === 'development') {
  window.electronAPI = window.electronAPI || {};
  window.electronAPI.isDev = true;
}
