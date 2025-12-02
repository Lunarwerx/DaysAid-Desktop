const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  hideWindow: () => ipcRenderer.send('hide-window'),
  onResetView: (callback) => ipcRenderer.on('reset-view', () => callback()),
  updateFollowerState: (enabled, count, settings) => ipcRenderer.send('update-follower-state', enabled, count, settings),
  getHotkey: () => ipcRenderer.invoke('get-hotkey'),
  setHotkey: (hotkey) => ipcRenderer.invoke('set-hotkey', hotkey),
  // Follower window handlers
  onFollowerUpdate: (callback) => ipcRenderer.on('update-count', (e, count) => callback(count)),
  onFollowerEffects: (callback) => ipcRenderer.on('update-effects', (e, settings) => callback(settings)),
});
