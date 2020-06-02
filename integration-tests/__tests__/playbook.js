/* eslint-env jest */

import path from 'path';
import dialogAddon from 'spectron-dialog-addon';
import { timing, paths, mockProtocol } from '../config';
import getData from '../getData';
import { forceClick } from './helpers';

/**
 * common tasks for using protocols
 */

export const loadProtocolFromFile = async (app, filename, repeat = false) => {
  const mockProtocolPath = path.join(paths.dataDir, filename);
  const mockFilenames = [mockProtocolPath];

  await dialogAddon.mock([{ method: 'showOpenDialog', value: { filePaths: mockFilenames } }]);
  await app.client.isVisible('.getting-started');
  await app.client.click('[name=add-a-protocol]');
  await app.client.waitForVisible('.protocol-import-dialog__tabs');
  await app.client.click('.tab=Local file');
  if (repeat) {
    await app.client.waitForVisible('h2=Update protocol installation');
    await app.client.click('button=Continue');
  }
  await app.client.waitForVisible('h4=Protocol imported successfully!');
  await app.client.click('button=Continue');
  await app.client.pause(timing.medium);
  await app.client.click('.overlay__close');
  await app.client.waitForExist('.modal', timing.long, true);
};

/**
 * For reuse when testing interfaces
 */
export const loadMockProtocolAsFile = async (app) => {
  await getData(mockProtocol)
    .then(([, filename]) => {
      console.info(`loading protocol at "${filename}".`);
      return loadProtocolFromFile(app, filename);
    });
};

export const loadMockProtocolAsFileAgain = async (app) => {
  await getData(mockProtocol)
    .then(([, filename]) => {
      console.info(`loading protocol at "${filename}".`);
      return loadProtocolFromFile(app, filename, true);
    });
};

export const loadProtocolFromNetwork = async (app, url = mockProtocol) => {
  await app.client.isVisible('.getting-started');
  await app.client.click('[name=add-a-protocol]');
  await app.client.waitForVisible('.protocol-import-dialog__tabs');
  await app.client.click('.tab=From URL');
  await app.client.pause(timing.medium);
  await app.client.setValue('input[name=protocol_url]', url);
  await app.client.click('button=Import');
  await app.client.waitForVisible('h4=Protocol imported successfully!', 120000); // 2 minutes
  await app.client.click('button=Continue');
  await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
};

export const startInterview = async (app, caseId = 'test') => {
  await app.client.click('[data-clickable="start-interview"]');
  await app.client.setValue('input[name=case_id]', caseId);
  await app.client.click('button=Start interview');
  await app.client.waitForVisible('.protocol');
};

export const goToStage = async (app, stageId) => {
  console.log('Going to stage ', stageId);
  if (!stageId) { throw Error('goToStage() requires a stageId'); }
  await app.client.click('.session-navigation__progress-bar');
  await app.client.waitForVisible('.stages-menu');
  await app.client.pause(timing.long); // Added to give menu stagger animation time to complete
  forceClick(app, `[data-stage-name=${stageId}]`);
  await app.client.pause(timing.long);
};

export const timelineNext = async (app) => {
  await app.client.click('.session-navigation__button--next');
};

export const timelinePrevious = async (app) => {
  await app.client.click('.session-navigation__button--back');
};
