/* eslint-env jest */
import { developmentProtocol } from '../config';
import getData from '../getData';
import {
  forceClick,
  pause,
  asyncForEach,
  matchImageSnapshot,
} from './helpers';
import {
  goToStage,
  loadProtocolFromFile,
} from './playbook';

/**
 * common tasks specific to the development protocol
 */

/**
 * For reuse when testing interfaces
 */
export const loadDevelopmentProtocol = async (app) => {
  await getData(developmentProtocol)
    .then(([, filename]) => {
      console.info(`loading protocol at "${filename}".`);
      return loadProtocolFromFile(app, filename);
    });
};

export const createNode = async (app, {
  name = 'foo',
  nickname = 'bar',
  age = 66,
  toggleGroup = 'Four',
}) => {
  await forceClick(app, '[data-clickable="open-add-node"]');
  // name
  await app.client.setValue('input[name="6be95f85-c2d9-4daf-9de1-3939418af888"]', name);
  // nickname
  await app.client.setValue('input[name="0e75ec18-2cb1-4606-9f18-034d28b07c19"]', nickname);
  // age
  await app.client.setValue('input[name="c5fee926-855d-4419-b5bb-54e89010cea6"]', age);
  // toggle group
  await app.client
    .$('[name="e343a91f-628d-4175-870c-957beffa0154"]')
    .click(`label*=${toggleGroup}`);
  await app.client.click('button=Finished');
  // otherwise the toggle groups don't reset?
  await pause(app, 500);
};

export const createNodes = async (app, nodes = []) => {
  await goToStage(app, 'namegen1');
  await asyncForEach(nodes, async node => createNode(app, node));
};
