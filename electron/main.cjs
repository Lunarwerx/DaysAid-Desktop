const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let followerWindow;
let tray = null;
let followerInterval;
let currentHotkey = 'F20';
let followerSettings = {
  orbit: false,
  pulse: false,
  shake: false,
  rainbow: false
};
let orbitAngle = 0;

// Settings file
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      if (settings.hotkey) currentHotkey = settings.hotkey;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify({ hotkey: currentHotkey }, null, 2));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  let icon;
  
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // Create a simple default icon if none exists
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('DaysAid');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide', click: () => toggleWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    alwaysOnTop: true
  });

  // Load from Vite dev server in development, or built files in production
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createFollowerWindow() {
  followerWindow = new BrowserWindow({
    width: 60,
    height: 60,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    transparent: true,
    focusable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const followerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .bell-container {
          position: relative;
          width: 24px;
          height: 24px;
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid #333;
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.5); } 100% { transform: scale(1); } }
        @keyframes rainbow { 0% { color: #ff0000; } 20% { color: #ffff00; } 40% { color: #00ff00; } 60% { color: #00ffff; } 80% { color: #0000ff; } 100% { color: #ff00ff; } }
        .effect-pulse .bell-container { animation: pulse 0.5s infinite ease-in-out; }
        .effect-rainbow .bell-container { animation: rainbow 0.5s infinite linear; }
      </style>
    </head>
    <body id="body">
      <div class="bell-container">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span id="badge" class="badge">0</span>
      </div>
      <script>
        window.electron.onFollowerUpdate((count) => {
          document.getElementById('badge').textContent = count;
        });
        window.electron.onFollowerEffects((settings) => {
          const body = document.getElementById('body');
          body.classList.toggle('effect-pulse', settings.pulse);
          body.classList.toggle('effect-rainbow', settings.rainbow);
        });
      </script>
    </body>
    </html>
  `;

  followerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(followerHtml)}`);
  followerWindow.setIgnoreMouseEvents(true);
  followerWindow.setAlwaysOnTop(true, 'screen-saver');
}

function startFollowerTracking() {
  if (followerInterval) clearInterval(followerInterval);

  followerInterval = setInterval(() => {
    if (followerWindow && !followerWindow.isDestroyed() && followerWindow.isVisible()) {
      const point = screen.getCursorScreenPoint();
      let x = point.x - 60;
      let y = point.y - 60;

      if (followerSettings.orbit) {
        const radius = 100;
        orbitAngle += 0.1;
        x = point.x + Math.cos(orbitAngle) * radius - 30;
        y = point.y + Math.sin(orbitAngle) * radius - 30;
      }

      if (followerSettings.shake) {
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
      }

      followerWindow.setBounds({ x: Math.round(x), y: Math.round(y), width: 60, height: 60 });
    }
  }, 16);
}

function stopFollowerTracking() {
  if (followerInterval) {
    clearInterval(followerInterval);
    followerInterval = null;
  }
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.webContents.send('reset-view');
    setTimeout(() => {
      mainWindow.show();
      mainWindow.focus();
    }, 10);
  }
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createFollowerWindow();
  createTray();

  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 100);

  const ret = globalShortcut.register(currentHotkey, toggleWindow);
  if (!ret) {
    console.log('Global shortcut registration failed for:', currentHotkey);
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Keep running
});

// IPC Handlers
ipcMain.handle('get-hotkey', () => currentHotkey);

ipcMain.handle('set-hotkey', (event, newHotkey) => {
  try {
    globalShortcut.unregister(currentHotkey);
    const success = globalShortcut.register(newHotkey, toggleWindow);
    if (success) {
      currentHotkey = newHotkey;
      saveSettings();
      return { success: true, hotkey: newHotkey };
    } else {
      globalShortcut.register(currentHotkey, toggleWindow);
      return { success: false, error: 'Failed to register hotkey' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.on('hide-window', () => {
  mainWindow.hide();
});

ipcMain.on('update-follower-state', (event, enabled, count, settings) => {
  if (!followerWindow || followerWindow.isDestroyed()) {
    createFollowerWindow();
  }

  if (settings) {
    followerSettings = settings;
  }

  if (enabled && count > 0) {
    if (!followerWindow.isVisible()) {
      followerWindow.showInactive();
      startFollowerTracking();
    }
    followerWindow.webContents.send('update-count', count);
    followerWindow.webContents.send('update-effects', followerSettings);
  } else {
    if (followerWindow.isVisible()) {
      followerWindow.hide();
      stopFollowerTracking();
    }
  }
});
