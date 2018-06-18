import { isNil } from 'lodash';

import { isElectron, isCordova } from './Environment';

const setUpXml = () => {
  const xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
    'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n' +
    'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n' +
    '  <graph edgedefault="undirected">\n' +
    ' </graph>\n' +
    ' </graphml>\n';

  let xml = '';
  if (window.DOMParser) { // Standard
    xml = (new DOMParser()).parseFromString(xmlDoc, 'text/xml');
  }
  return xml;
};

const getVariableInfo = (variableRegistry, type, element, key) => (
  variableRegistry[type] && variableRegistry[type][element.type] &&
  variableRegistry[type][element.type].variables &&
  variableRegistry[type][element.type].variables[key]
);

const isVariableRegistryExists = (variableRegistry, type, element, key) => {
  const knownTypes = ['boolean', 'text', 'number', 'datetime', 'categorical', 'ordinal', 'layout',
    'location'];
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo.type && knownTypes.includes(variableInfo.type);
};

const getTypeFromVariableRegistry = (variableRegistry, type, element, key) => {
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo.type;
};

const getTypeForKey = (data, key) => (
  data.reduce((result, value) => {
    if (isNil(value[key])) return result;
    let currentType = typeof value[key];
    if (currentType === 'number') {
      currentType = Number.isInteger(value[key]) ? 'integer' : 'double';
      if (result && currentType !== result) return 'double';
    }
    if (String(Number.parseInt(value[key], 10)) === value[key]) {
      currentType = 'integer';
      if (result === 'double') return 'double';
    } else if (String(Number.parseFloat(value[key], 10)) === value[key]) {
      currentType = 'double';
      if (result === 'integer') return 'double';
    }
    if (isNil(currentType)) return result;
    if (currentType === result || result === '') return currentType;
    return 'string';
  }, ''));

const generateKeys = (graph, graphML, elements, type, excludeList, variableRegistry) => {
// generate keys for attributes
  const done = [];
  elements.forEach((element) => {
    Object.keys(element).forEach((key) => {
      if (done.indexOf(key) === -1 && !excludeList.includes(key)) {
        const keyElement = document.createElementNS(graphML.namespaceURI, 'key');
        keyElement.setAttribute('id', key);
        keyElement.setAttribute('attr.name', key);

        if (!isVariableRegistryExists(variableRegistry, type, element, key)) {
          // TODO hard fail
        }

        switch (getTypeFromVariableRegistry(variableRegistry, type, element, key)) {
          case 'boolean':
            keyElement.setAttribute('attr.type', 'boolean');
            break;
          case 'integer':
            keyElement.setAttribute('attr.type', 'integer');
            break;
          case 'double':
            keyElement.setAttribute('attr.type', 'double');
            break;
          case 'ordinal':
          case 'number': {
            const keyType = getTypeForKey(elements, key);
            keyElement.setAttribute('attr.type', keyType);
            break;
          }
          case 'layout': {
            // special handling for locations
            keyElement.setAttribute('attr.name', `${key}Y`);
            keyElement.setAttribute('id', `${key}Y`);
            keyElement.setAttribute('attr.type', 'double');
            const keyElement2 = document.createElementNS(graphML.namespaceURI, 'key');
            keyElement2.setAttribute('id', `${key}X`);
            keyElement2.setAttribute('attr.name', `${key}X`);
            keyElement2.setAttribute('attr.type', 'double');
            keyElement2.setAttribute('for', type);
            graphML.insertBefore(keyElement2, graph);
            break;
          }
          case 'text':
          case 'datetime':
          case 'categorical':
          case 'location':
          default:
            keyElement.setAttribute('attr.type', 'string');
        }
        keyElement.setAttribute('for', type);
        graphML.insertBefore(keyElement, graph);
        done.push(key);
      }
    });
  });
};

const getDataElement = (uri, key, text) => {
  const data = document.createElementNS(uri, 'data');
  data.setAttribute('key', key);
  data.appendChild(document.createTextNode(text));
  return data;
};

const addElements = (graph, uri, dataList, type, excludeList, variableRegistry, extra: false) => {
  dataList.forEach((dataElement, index) => {
    const domElement = document.createElementNS(uri, type);
    if (dataElement.id) {
      domElement.setAttribute('id', dataElement.id);
    } else {
      domElement.setAttribute('id', index);
    }
    if (extra) domElement.setAttribute('source', dataElement.from);
    if (extra) domElement.setAttribute('target', dataElement.to);
    graph.appendChild(domElement);

    Object.keys(dataElement).forEach((key) => {
      if (!excludeList.includes(key)) {
        if (typeof dataElement[key] !== 'object') {
          domElement.appendChild(getDataElement(uri, key, dataElement[key]));
        } else if (getTypeFromVariableRegistry(variableRegistry, type, dataElement, key) === 'layout') {
          domElement.appendChild(getDataElement(uri, `${key}X`, dataElement[key].x));
          domElement.appendChild(getDataElement(uri, `${key}Y`, dataElement[key].y));
        } else {
          domElement.appendChild(getDataElement(uri, key, JSON.stringify(dataElement[key])));
        }
      }
    });
  });
};

const xmlToString = (xmlData) => {
  let xmlString;
  if (window.ActiveXObject) { // IE
    xmlString = xmlData.xml;
  } else { // code for Mozilla, Firefox, Opera, etc.
    xmlString = (new XMLSerializer()).serializeToString(xmlData);
  }
  return xmlString;
};

const saveFile = (data, openErrorDialog) => {
  if (isElectron()) { // electron save dialog
    const fs = window.require('fs');
    const { dialog } = window.require('electron').remote;
    dialog.showSaveDialog({ filters: [{ name: 'graphml', extensions: ['graphml'] }] }, (filename) => {
      if (filename === undefined) return;
      fs.writeFile(filename, data, (err) => {
        if (err) {
          dialog.showErrorBox('Error Saving File.', err.message);
        }
      });
    });
  } else if (isCordova()) { // cordova save temp file and then share
    const getFileSystem = () => new Promise((resolve, reject) => {
      window.requestFileSystem(
        window.LocalFileSystem.TEMPORARY,
        5 * 1024 * 1024,
        fileSystem => resolve(fileSystem),
        err => reject(err),
      );
    });

    const getFile = fileSystem => new Promise((resolve, reject) => {
      fileSystem.root.getFile('networkcanvas.graphml', { create: true, exclusive: false },
        fileEntry => resolve(fileEntry),
        err => reject(err),
      );
    });

    const createWriter = fileEntry => new Promise((resolve, reject) => {
      fileEntry.createWriter(
        fileWriter => resolve({ fileWriter, filename: fileEntry.toURL() }),
        err => reject(err),
      );
    });

    const writeFile = ({ fileWriter, filename }) => new Promise((resolve, reject) => {
      const blob = new Blob([data], { type: 'text/xml' });
      fileWriter.seek(0);
      fileWriter.onwrite = () => resolve(filename); // eslint-disable-line no-param-reassign
      fileWriter.onerror = err => reject(err); // eslint-disable-line no-param-reassign
      fileWriter.write(blob);
    });

    getFileSystem()
      .then(getFile)
      .then(createWriter)
      .then(writeFile)
      .then((filename) => {
        const options = {
          message: 'Your network canvas graphml file.', // not supported on some apps
          subject: 'network canvas export',
          files: [filename],
          chooserTitle: 'Share file via', // Android only
        };
        window.plugins.socialsharing.shareWithOptions(options);
      })
      .catch(() => { openErrorDialog(); });
  } else { // browser save to downloads
    const blob = new Blob([data], { type: 'text/xml' });
    const element = document.createElement('a');
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', 'networkcanvas.graphml');
    element.style.display = 'none';
    document.getElementById('root').appendChild(element);
    element.click();
    document.getElementById('root').removeChild(element);
    window.URL.revokeObjectURL(blob);
  }
};

const createGraphML = (networkData, variableRegistry, openErrorDialog) => {
  // default graph structure
  const xml = setUpXml();
  const graph = xml.getElementsByTagName('graph')[0];
  const graphML = xml.getElementsByTagName('graphml')[0];

  // generate keys for attributes
  generateKeys(graph, graphML, networkData.nodes, 'node', ['id'], variableRegistry);
  generateKeys(graph, graphML, networkData.edges, 'edge', ['from', 'to', 'id'], variableRegistry);

  // add nodes and edges to graph
  addElements(graph, graphML.namespaceURI, networkData.nodes, 'node', ['id'], variableRegistry);
  addElements(graph, graphML.namespaceURI, networkData.edges, 'edge', ['from', 'to', 'id'], variableRegistry, true);

  saveFile(xmlToString(xml), openErrorDialog);
};

export default createGraphML;
