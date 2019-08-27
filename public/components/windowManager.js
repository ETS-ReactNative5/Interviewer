const { BrowserWindow, Menu, shell } = require('electron');
const mainMenu = require('./mainMenu');
const appUrl = require('./appURL');

const isMacOS = () => process.platform === 'darwin';
const isTest = () => !!process.env.TEST;

const titlebarParameters = isMacOS() ? { titleBarStyle: 'hidden', frame: false } : { autoHideMenuBar: true };

let window;

function setApplicationMenu(appWindow) {
  const appMenu = Menu.buildFromTemplate(mainMenu(appWindow));
  Menu.setApplicationMenu(appMenu);
}

function loadApp(appWindow, cb) {
  appWindow.webContents.on('did-finish-load', cb);

  appWindow.loadURL(appUrl);
}

function createWindow() {
  if (window) { return Promise.resolve(window); }

  return new Promise((resolve) => {
    // TODO: custom env var? NO_CONSTRAIN?
    const minDimensions = isTest() ?
      {} :
      { minWidth: 1280, minHeight: 800 };

    // Create the browser window.
    const windowParameters = Object.assign({
      width: 1440,
      height: 900,
      center: true,
      title: 'Network Canvas',
    }, minDimensions, titlebarParameters);

    const mainWindow = new BrowserWindow(windowParameters);

    // Open any new windows in default browser (not electron)
    // NOTE: This differs from Architect, which does not support opening links
    mainWindow.webContents.on('new-window', (evt, newUrl) => {
      evt.preventDefault();
      shell.openExternal(newUrl);
    });

    // For now, any navigation off the SPA is unneeded
    mainWindow.webContents.on('will-navigate', (evt) => {
      evt.preventDefault();
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools();
    }

    window = mainWindow;

    window.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      window = null;
    });

    setApplicationMenu(window);

    loadApp(window, () => resolve(window));
  });
}

const windowManager = {
  get hasWindow() { return !!window; },
  getWindow: function getWindow() {
    return createWindow();
  },
};

module.exports = windowManager;
