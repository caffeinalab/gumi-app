const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')
const fs = require('fs');
const url = require('url')
const exec = require('child_process').exec;

let settings = {};
const settingsPath = path.join(__dirname, 'settings.json');

const assetsDirectory = __dirname //path.join(__dirname, 'assets')

let tray = undefined
let window = undefined
let currentSettings= undefined


function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function getGitInfo(){
  return new Promise(function(resolve,reject){
  execute("git config --global user.name", function(name){
     execute("git config --global user.email", function(email){
       console.log({ username: name.replace("\n", ""), email: email.replace("\n", "") });
       resolve({ username: name.replace("\n", ""), email: email.replace("\n", "") });
     });
   });
  });
}

function setGitInfo(newSettings){
  return new Promise(function(resolve,reject){
  execute(`git config --global user.name \"${newSettings.username}\"`, function(name){
     execute(`git config --global user.email \"${newSettings.email}\"`, function(email){
      getGitInfo();
     });
   });
  });
}

function readSettings(){
  try {
  settings = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(settings);
  console.log('Loaded file:' + settingsPath, settings)
  } catch (err) {
  console.log('Error reading the file: ' + JSON.stringify(err));
  }
}

function saveSettings(content){
  try { 
  fs.writeFileSync(settingsPath, content, 'utf-8'); 
  }
  catch(e) { alert('Failed to save the file !'); }
}

function createMenuTray(){
    readSettings();

    var menuItems = [
    {label: 'Add an user..', type: 'normal', click: function(){createWindow('new-profile')}}
    ];

    var count = 0;
    for (var key in settings){
    if(count == 0){
      menuItems.push({type: 'separator'})
    }
    var value = settings[key];
    var checked = false;
    if(value.username == currentSettings.username && value.email == currentSettings.email ){
      checked = true;
    }
    menuItems.push({ 
      label: key,
      type: 'radio',
      checked: checked,
      click: function(menuItem){
      setGitInfo(settings[menuItem.label])
      console.log(menuItem.label)}}

      )
    count++;
    }
    return menuItems;
}

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  getGitInfo().then(createTray);
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'icon.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
  let menuItems = createMenuTray();
  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.setContextMenu(contextMenu)
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = (state) => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
 window.custom = {
     'currentState': state ? state : 'list',
     'getSettings': function(){
      return settings;
     }
   };
  window.loadURL(url.format({
    pathname: path.join(__dirname, '/client/public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})