/* eslint-disable global-require */

import Zip from 'jszip';
import environments from '../environments';
import inEnvironment from '../Environment';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import { removeDirectory, ensurePathExists, readFile, writeStream, inSequence } from '../filesystem';
import { protocolPath } from './';
import { assertNonEmptyPath, assertNoTraversalInPath, assertRelativePath } from './validation/zipValidation';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const openError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");
const loadError = friendlyErrorMessage("We couldn't load that Network Canvas protocol. Try importing again.");

const prepareDestination = destination =>
  removeDirectory(destination)
    .then(() => ensurePathExists(destination));

const extractZipDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (zipObject, destination) => {
      const extractPath = path.join(destination, zipObject.name);

      return ensurePathExists(extractPath);
    };
  }

  if (environment === environments.CORDOVA) {
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;

      return ensurePathExists(extractPath);
    };
  }

  return () => Promise.reject(new Error('extractZipDir() not available on platform'));
});

const extractZipFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (zipObject, destination) => {
      const extractPath = path.join(destination, zipObject.name);

      return writeStream(extractPath, zipObject.nodeStream());
    };
  }

  if (environment === environments.CORDOVA) {
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;
      return writeStream(extractPath, zipObject.internalStream('uint8array'));
    };
  }

  return () => Promise.reject(new Error('extractZipFile() not available on platform'));
});

const checkZipPaths = inEnvironment((environment) => {
  if (environment === environments.ELECTRON || environment === environments.CORDOVA) {
    return zipPaths =>
      new Promise((resolve, reject) => {
        try {
          zipPaths.forEach((pathname) => {
            assertNonEmptyPath(pathname);
            assertRelativePath(pathname);
            assertNoTraversalInPath(pathname);
          });
        } catch (err) {
          reject(err);
          return;
        }
        resolve();
      });
  }

  return () => Promise.reject(new Error('checkZipPaths() not available on platform'));
});

const extractZip = inEnvironment((environment) => {
  if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
    return (zip, destination) =>
      prepareDestination(destination)
        .then(() => checkZipPaths(Object.keys(zip.files)))
        .then(() =>
          inSequence(
            Object.values(zip.files),
            zipObject => (
              zipObject.dir ?
                extractZipDirectory(zipObject, destination) :
                extractZipFile(zipObject, destination)
            ),
          ),
        );
  }

  return () => Promise.reject(new Error('extractZip() not available on platform'));
});

const loadZip = inEnvironment((environment) => {
  if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
    return source =>
      readFile(source)
        .then(data => Zip.loadAsync(data))
        .catch(loadError);
  }

  throw new Error(`loadZip() not available on platform ${environment}`);
});

const importZip = inEnvironment((environment) => {
  if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
    return (protocolFile, protocolName, destination) =>
      loadZip(protocolFile)
        .then(zip => extractZip(zip, destination))
        .catch(openError)
        .then(() => protocolName);
  }

  return () => Promise.reject(new Error('loadZip() not available on platform'));
});

const extractProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolFile = isRequired('protocolFile')) => {
      const protocolName = path.basename(protocolFile);
      const destination = protocolPath(protocolName);
      const returnVal = importZip(protocolFile, protocolName, destination);
      console.log(returnVal);
      return importZip(protocolFile, protocolName, destination);
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolFileUri = isRequired('protocolFileUri')) => {
      const protocolName = new URL(protocolFileUri).pathname.split('/').pop();
      const destination = protocolPath(protocolName);

      return importZip(protocolFileUri, protocolName, destination);
    };
  }

  return () => Promise.reject(new Error('extractProtocol() not available on platform'));
});

export default extractProtocol;

export {
  checkZipPaths,
};
