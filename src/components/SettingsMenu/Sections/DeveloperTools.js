/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'connected-react-router';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui/lib/components';
import { Number } from '@codaco/ui/lib/components/Fields';
import { importProtocolFromURI } from '../../../utils/protocol/importProtocol';
import { actionCreators as dialogsActions } from '../../../ducks/modules/dialogs';
import { actionCreators as mockActions } from '../../../ducks/modules/mock';
import { getAdditionalAttributesForCurrentPrompt, getNodeEntryForCurrentPrompt } from '../../../selectors/session';
import { DEVELOPMENT_PROTOCOL_URL } from '../../../config';
import TabItemVariants from './TabItemVariants';
import useAPI from '../../../hooks/useApi';

const DeveloperTools = (props) => {
  const {
    handleResetAppData,
    handleAddMockNodes,
    shouldShowMocksItem,
    generateMockSessions,
  } = props;

  const [sessionCount, setSessionCount] = useState(10);
  const [selectedProtocol, setSelectedProtocol] = useState('');

  const { data: protocols } = useAPI('protocols');

  return (
    <>
      <motion.article variants={TabItemVariants} className="settings-element">
        <div className="form-field-container">
          <div className="form-field">
            <Button
              id="reset-all-nc-data"
              color="neon-coral"
              onClick={handleResetAppData}
            >
              Reset data
            </Button>
          </div>
        </div>
        <div>
          <h2>Reset All App Data</h2>
          <p>
            Click the button above to reset all Interviewer data. This will erase any
            in-progress interviews, and all application settings.
          </p>
        </div>
      </motion.article>
      {
        shouldShowMocksItem
        && (
        <motion.article variants={TabItemVariants} className="settings-element">
          <div className="form-field-container">
            <div className="form-field">
              <Button
                id="add-mock-nodes"
                onClick={handleAddMockNodes}
              >
                Add nodes
              </Button>
            </div>
          </div>
          <div>
            <h2>Add Mock Nodes</h2>
            <p>
              During an active interview session, clicking this button will create
              mock nodes for testing purposes.
            </p>
          </div>
        </motion.article>
        )
      }
      <motion.article variants={TabItemVariants} className="settings-element">
        <div className="form-field-container">
          <div className="form-field">
            <Button
              onClick={() => importProtocolFromURI(DEVELOPMENT_PROTOCOL_URL)}
            >
              Import
            </Button>
          </div>
        </div>
        <div>
          <h2>Import Development Protocol</h2>
          <p>
            Clicking this button will import the latest development protocol for this
            version of Network Canvas Interviewer.
          </p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element--sub-item">
        <div>
          <h2>Generate test sessions</h2>
          <p>
            This function creates dummy data for testing export code and device performance.
          </p>
        </div>
        <h4>Use protocol</h4>
        <div className="form-field-container">
          <div className="form-field">
            <select
              name="selectedProtocol"
              className="select-css"
              value={selectedProtocol}
              onChange={(e) => { setSelectedProtocol(e.target.value); }}
            >
              <option value="">-- Select a protocol ---</option>
              {
                protocols && protocols.map((protocol) => (
                  <option
                    value={protocol._id}
                    key={protocol._id}
                  >
                    {protocol.name}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
        <h4>Number of sessions</h4>
        <Number
          input={{
            value: sessionCount,
            onChange: (e) => setSessionCount(e),
            validation: {
              required: true,
              minValue: 1,
            },
          }}
          name="sessionCount"
        />
        <Button
          disabled={!selectedProtocol}
          onClick={() => {
            generateMockSessions(
              selectedProtocol,
              protocols[selectedProtocol],
              sessionCount,
            );
          }}
        >
          Generate
        </Button>
      </motion.article>
    </>
  );
};

const developerToolsHandlers = withHandlers({
  handleAddMockNodes: (props) => () => {
    if (!props.nodeVariableEntry) {
      return;
    }
    const [typeKey, nodeDefinition] = props.nodeVariableEntry;
    props.generateMockNodes(nodeDefinition.variables, typeKey, 20, props.additionalMockAttributes);
    props.closeMenu();
  },
  handleResetAppData: (props) => () => {
    props.openDialog({
      type: 'Warning',
      title: 'Reset application data?',
      message: 'This will delete ALL data from Interviewer, including interview data and settings. Do you wish to continue?',
      onConfirm: () => {
        props.resetState();
      },
      confirmLabel: 'Continue',
    });
  },
});

const mapDispatchToProps = (dispatch) => ({
  generateMockNodes: bindActionCreators(mockActions.generateMockNodes, dispatch),
  generateMockSessions: bindActionCreators(mockActions.generateMockSessions, dispatch),
  openDialog: bindActionCreators(dialogsActions.openDialog, dispatch),
  resetState: () => dispatch(push('/reset')),
});

const mapStateToProps = (state) => ({
  nodeVariableEntry: getNodeEntryForCurrentPrompt(state),
  shouldShowMocksItem: !!getNodeEntryForCurrentPrompt(state),
  additionalMockAttributes: getAdditionalAttributesForCurrentPrompt(state),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  developerToolsHandlers,
)(DeveloperTools);
