const { app, BrowserWindow } = require('electron')
const path = require("path")
const isDev = require('electron-is-dev')

function createWindow() {
    var win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // win.loadFile('index.html')
    win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`)

    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
}

// app.whenReady().then(createWindow)
app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // if (BrowserWindow.getAllWindows().length === 0) {
    //     createWindow()
    // }
    if (win == null) {
        createWindow()
    }
})