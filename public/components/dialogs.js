const { dialog } = require('electron');

const openDialogOptions = {
  buttonLabel: 'Open',
  nameFieldLabel: 'Open:',
  defaultPath: 'Protocol.netcanvas',
  filters: [{ name: 'Network Canvas', extensions: ['netcanvas'] }],
  properties: ['openFile'],
};

const openDialog = () =>
  new Promise((resolve, reject) => dialog.showOpenDialog(openDialogOptions)
    .then(({ canceled, filePaths }) => {
      console.log(filePaths);
      if (canceled || !filePaths) { reject('Import protocol dialog cancelled.'); }
      if (!filePaths.length || filePaths.length !== 1) { reject('Only a single protocol may be imported at a time.'); }
      resolve(filePaths[0]);
    }));

module.exports = {
  openDialog,
};
