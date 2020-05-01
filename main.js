const {app, Menu, Tray, BrowserWindow, nativeImage, ipcMain} = require('electron')

const path = require('path')
const fs = require('fs')
const url = require('url')
const child_process	= require('child_process')
const _ = require('underscore')

const DEBUG = false
const CWD = process.cwd()
const execOpts = { cwd: CWD, stdio: [0, 1, 2], sync: true } // stdio is only needed for execSync|spawn
const settingsPath = path.join(app.getPath('userData'), 'settings.json')
const assetsDirectory = path.join(__dirname, 'assets')

const defaultTheme = 'light-theme'  //  or 'dark-theme'
let settings = {}
let currentUser = undefined
let autoSwitchTimeout = undefined

app.dock.hide()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray


// ///////////
// Helpers //
// ///////////

const log = (err, stdout, stderr) => {
  if (err) process.stdout.write(`${err}\n`)

  if (stderr !== null && stderr !== '') process.stdout.write(`${stderr}\n`)
  if (stdout !== null && stdout !== '') process.stdout.write(`${stdout}\n`)
}

const execute = (cmd, opts, callback) => {
  if (_(opts).isFunction()) {
    callback = opts
    opts = {}
  }
  opts = _(execOpts).extend(opts)

  if (opts.sync || !_.isArray(cmd)) {
    if (DEBUG) console.log('--', 'Sync command: ', JSON.stringify(cmd), JSON.stringify(opts), callback)

    if (_.isArray(cmd)) cmd = cmd.join(' ') // escape(cmd)
    child_process.exec(cmd, opts, callback)
  } else {
    return new Promise((resolve, reject) => {
      if (DEBUG) console.log('--', 'Spawn command', JSON.stringify(cmd), cmd.join(' '), JSON.stringify(opts))

      const spawned = child_process.spawn(cmd.shift(), cmd, opts)
      spawned.on('close', (err) => {
        if (err != 0) log(`Process exited with code ${err}`, false, false)

        if (err != 0) reject(err, false, false)
        // else reject(err)
      })

      spawned.stdout.on('data', (data) => {
        if (callback) callback(false, data, false)
        else resolve(data)
      })
    })
  }
}


function getGitInfo() {
  return new Promise((resolve, reject) => {
    execute('git config --global user.name', (err, username) => {
      execute('git config --global user.email', (err, email) => {
        if (!_(username).isString() || !_(email).isString()) {
          resolve({})
          return false
        }
        username = username.replace('\n', '')
        email = email.replace('\n', '')
        currentUser = undefined

        const ob = {}

        for (const key in settings.profiles) {
          if (settings.profiles[key].username == username && settings.profiles[key].email == email) {
            currentUser = key
            ob[key] = settings.profiles[key]
            break
          }
        }

        if (!currentUser) {
          const id = Date.now()
          currentUser = id
          ob[id] = {
            label: username,
            username: username,
            email: email
          }
        }

        resolve(ob)
      })
    })
  })
}

function setGitInfo(key) {
  return new Promise((resolve, reject) => {
    if (!settings.profiles[key]) return reject()

    execute(`git config --global user.name \"${settings.profiles[key].username}\"`, (name) => {
      execute(`git config --global user.email \"${settings.profiles[key].email}\"`, (email) => {
        currentUser = key

        getGitInfo()
          .then(resolve)
          .catch(reject)
      })
    })
  })
}

function checkIfRightUser() {
  return new Promise((resolve, reject) => {
    if( settings.backToPreviousUser && settings.previousUser){
        setPreviousUser()
    }
    resolve();
  })
}

// ///////////
// /// UI ////
// ///////////

const getWindowPosition = () => {
  const windowBounds = mainWindow.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const showWindow = () => {
  const position = getWindowPosition()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

const getTrayMenu = function() {
  const minute = 60000
  return Menu.buildFromTemplate([
    {
      label: 'Current profile:',
      enabled: false
    },
    {
      label: settings.profiles[currentUser].label,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Temporary switch:',
      enabled: false
    },
    {
      type: 'radio',
      label: 'Disabled',
      checked: settings.temporarySwitch === false,
      click: () => changeTemporarySwitch(false)
    },
    {
      type: 'radio',
      label: '1 min',
      checked: settings.temporarySwitch === minute,
      click: () => changeTemporarySwitch(minute)
    },
    {
      type: 'radio',
      label: '30 min',
      checked: settings.temporarySwitch === 30 * minute,
      click: () => changeTemporarySwitch(30 * minute)
    },
    {
      type: 'radio',
      label: '1 hour',
      checked: settings.temporarySwitch === 60 * minute,
      click: () => changeTemporarySwitch(60 * minute)
    },
    {
      type: 'radio',
      label: '4 hour',
      checked: settings.temporarySwitch === 4 * 60 * minute,
      click: () => changeTemporarySwitch(4 * 60 * minute)
    },
    {
      type: 'radio',
      label: '12 hour',
      checked: settings.temporarySwitch === 12 * 60 * minute,
      click: () => changeTemporarySwitch(12 * 60 * minute)
    },
    {
      type: 'separator'
    },
    {
      label: 'Select theme:',
      enabled: false
    },
    {
      type: 'radio',
      label: 'Light theme',
      checked: getCurrentTheme() == 'light-theme',
      click: changeTheme
    },
    {
      type: 'radio',
      label: 'Dark theme',
      checked: getCurrentTheme() == 'dark-theme',
      click: changeTheme
    },
    {
      type: 'separator'
    },
    {
      type: 'checkbox',
      label: 'Start at login',
      checked: getAutoStart() == true,
      click: toggleAutoStart
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click() {  app.quit() }
    }
  ])
}


function createTray() {
  tray = new Tray(path.join(assetsDirectory, 'logoTemplate.png'))
  tray.on('right-click', () => { tray.popUpContextMenu(getTrayMenu()) })
  tray.on('double-click', toggleWindow)
  tray.on('click', toggleWindow)

  createWindow()

  return true
}

function createWindow(state) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 350,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    }
  })

  mainWindow.custom = {
    'currentState': state ? state : 'profile-list',
    'theme': getCurrentTheme()
  }

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/client/public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Hide the window when it loses focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide()
    }
  })
}

// ///////////
// // APP ////
// ///////////

function readSettings() {
  return new Promise((resolve, reject) => {
    try {
      settings = fs.readFileSync(settingsPath, 'utf-8')
      settings = JSON.parse(settings)
      if (DEBUG) console.log('Loaded file:' + settingsPath, settings)
      resolve(settings)
    } catch (err) {
      if (DEBUG) console.log('Error reading the file: ' + JSON.stringify(err))
      reject(null)
    }
  })
}

function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf-8')
  } catch (e) {
    alert('Failed to save the file !')
  }
}

function insertOrUpdateSetting(ob) {
  if (!settings.profiles) { settings.profiles = {} }
  _(settings.profiles).extend(ob)
  saveSettings()
}

function removeSetting(key) {
  if (!settings.profiles || settings.profiles[key] == null) return
  delete settings.profiles[key]
  saveSettings()
}

function getAllSettings() {
  return settings.profiles
}

function activateSetting(key) {
  if (!settings.profiles[key]) {
    return
  }
  if (autoSwitchTimeout) {
		clearTimeout(autoSwitchTimeout)
	}
	
	settings.backToPreviousUser = false
  settings.previousUser = currentUser
  setGitInfo(key)

  if (settings.temporarySwitch) {
		settings.backToPreviousUser = Date.now() + settings.temporarySwitch
		autoSwitchTimeout = setTimeout(setPreviousUser, settings.temporarySwitch)
		saveSettings()
  }
}

function getCurrentTheme() {
  return settings.theme ? settings.theme : defaultTheme
}

function setPreviousUser() {
	setGitInfo(settings.previousUser)
	notifyUserChange()
	settings.backToPreviousUser = false
	settings.previousUser = false
	saveSettings()
}
function changeTheme() {
  if (getCurrentTheme() == 'light-theme') {
    settings.theme = 'dark-theme'
  } else {
    settings.theme = 'light-theme'
  }
  mainWindow.webContents.send('changeTheme', settings.theme)
  saveSettings()
}

function changeTemporarySwitch(value) {
  settings.temporarySwitch = value
  saveSettings()
}

function notifyUserChange(){
	mainWindow.webContents.send('changeUser', settings.profiles[currentUser].label)
}

function getAutoStart() {
  return settings.autostart ? settings.autostart : false
}

function toggleAutoStart() {
  settings.autostart = !getAutoStart()
  setAutoStart()
}

function setAutoStart() {
  app.setLoginItemSettings({
    openAtLogin: !! settings.autostart,
  })

  saveSettings()
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

(function() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', function() {
    // createWindow()
    ipcMain.on('callSyncMethod', (event, type, data) => {
      if (DEBUG) console.log(type, data)
      switch (type) {
        case 'getCurrentUser':
          // update currentUser
          getGitInfo()
          event.returnValue = currentUser
          break
        case 'getSettings':
          event.returnValue = getAllSettings()
          break
        case 'removeSetting':
          removeSetting(data)
          event.returnValue = true
          break
        case 'activateSetting':
          activateSetting(data)
          event.returnValue = true
          break
        case 'insertOrUpdateSetting':
          insertOrUpdateSetting(data)
          event.returnValue = true
          break
      }
    })

    readSettings()
      .then(getGitInfo)
      .then(insertOrUpdateSetting)
			.then(checkIfRightUser)
      .then(createTray)
      .then(setAutoStart)
      .catch(() => {
        if (DEBUG) console.log('First launch probably!')
        return getGitInfo()
          .then(insertOrUpdateSetting)
          .then(createTray)
          .then(setAutoStart)
          .catch(log)
      })
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
      createTray()
    }
  })
})()
