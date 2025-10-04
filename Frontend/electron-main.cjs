const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

let mainWindow;

function createWindow() {

  // ✅ Set up Express server
  const server = express();
  const PORT = 5174;

  server.use(cors());
  server.use(express.static(path.join(__dirname, 'dist')));

  server.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);

    // ✅ Now that server is ready, create window
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        contextIsolation: true,
      },
    });

    mainWindow.loadURL(`http://localhost:${PORT}`);
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
