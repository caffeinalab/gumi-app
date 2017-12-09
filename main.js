const {app, Menu, Tray, BrowserWindow, nativeImage} = require('electron')


const path = require('path')
const fs = require('fs');
const url = require('url')

let settings = {};
const settingsPath = path.join(__dirname, 'settings.json');

app.dock.hide()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let tray = null

var exec = require('child_process').exec;

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

var currentSettings;
function createTray(settings){
  currentSettings = settings;
  readSettings();

  var menuItems = [
	{label: 'Add an user..', type: 'normal', click: function(){createWindow('new-profile')}}
  ];

  var count = 0;
  for (var key in currentSettings){
	if(count == 0){
	  menuItems.push({type: 'separator'})
	}
	var value = currentSettings[key];
	var checked = false;
	if(value.username == currentSettings.username && value.email == currentSettings.email ){
	  checked = true;
	}
	menuItems.push({ 
	  label: key,
	  type: 'radio',
	  checked: checked,
	  click: function(menuItem){
		setGitInfo(currentSettings[menuItem.label])
		console.log(menuItem.label)}}

	  )
	count++;
  }

  var image = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));  
  image.setTemplateImage(true); 

  tray = new Tray(image)
  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
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


function createWindow (state) {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.custom = {
	   'currentState': state ? state : 'list',
	   'getSettings': function(){
		  return settings;
	   }
   };

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
	pathname: path.join(__dirname, '/client/public/index.html'),
	protocol: 'file:',
	slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
	// Dereference the window object, usually you would store windows
	// in an array if your app supports multi windows, this is the time
	// when you should delete the corresponding element.
	mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  // createWindow()
  getGitInfo().then(createTray);
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
	app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {

	console.log('in active');
	createWindow()
	createTray()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
