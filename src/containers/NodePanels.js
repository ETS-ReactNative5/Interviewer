import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { makeGetAdditionalAttributes } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import { Panels } from '../components/';
import { makeGetPanelConfiguration } from '../selectors/name-generator';
import NodePanel from './NodePanel';
import { MonitorDragSource } from '../behaviours/DragAndDrop';

/**
  * Configures and renders `NodePanels` according to the protocol config
  */
class NodePanels extends PureComponent {
  static propTypes = {
    isDragging: PropTypes.bool,
    meta: PropTypes.object,
    panels: PropTypes.array,
    prompt: PropTypes.object,
    newNodeAttributes: PropTypes.object.isRequired,
    removeNode: PropTypes.func.isRequired,
    stage: PropTypes.object,
    removeNodeFromPrompt: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isDragging: false,
    meta: {},
    panels: [],
    prompt: { id: null },
    stage: { id: null },
  };

  constructor(props) {
    super(props);

    this.state = {
      panelIndexes: [],
    };

    this.colorPresets = [
      getCSSVariableAsString('--primary-color-seq-1'),
      getCSSVariableAsString('--primary-color-seq-2'),
      getCSSVariableAsString('--primary-color-seq-3'),
      getCSSVariableAsString('--primary-color-seq-4'),
      getCSSVariableAsString('--primary-color-seq-5'),
    ];
  }

  getHighlight = (panelNumber) => {
    if (panelNumber === 0) { return null; }

    return this.colorPresets[panelNumber % this.colorPresets.length];
  };

  handleDrop = ({ meta }, dataSource) => {
    /**
     * Handle a node being dropped into a panel
     * If this panel is showing the interview network, remove the node from the current prompt.
     * If it is an external data panel, remove the node form the interview network.
    */
    if (dataSource === 'existing') {
      this.props.removeNodeFromPrompt(
        meta[entityPrimaryKeyProperty],
        this.props.prompt.id,
        this.props.newNodeAttributes,
      );
    } else {
      this.props.removeNode(meta[entityPrimaryKeyProperty]);
    }
  }

  isPanelEmpty = index => (
    this.state.panelIndexes[index] &&
    this.state.panelIndexes[index].count === 0
  );

  isPanelCompatible = (index) => {
    const {
      panels,
      meta,
    } = this.props;

    const panel = panels[index];
    const panelIndex = this.state.panelIndexes[index].index;

    // We only accept existing nodes in panels
    if (meta.itemType !== 'EXISTING_NODE') { return false; }

    // Rules for when panel contains existing nodes
    if (panel.dataSource === 'existing') {
      // Don't allow nodes into existing panel if this is their last prompt ID
      return (
        meta.promptIDs.length !== 1
      );
    }

    // Rules for when panel contains external data
    // We need the original list though
    return panelIndex && panelIndex.has(meta[entityPrimaryKeyProperty]);
  };

  isPanelOpen = index =>
    (this.props.isDragging && this.isPanelCompatible(index)) || !this.isPanelEmpty(index);

  isAnyPanelOpen = () =>
    this.props.panels.some((panel, index) => this.isPanelOpen(index));

  handlePanelUpdate = (index, displayCount, nodeIndex) => {
    this.setState((state) => {
      const panelIndexes = [...state.panelIndexes];
      panelIndexes[index] = { count: displayCount, index: nodeIndex };

      return {
        panelIndexes,
      };
    });
  }

  renderNodePanel = (panel, index) => {
    const {
      stage,
      prompt,
    } = this.props;

    const {
      highlight,
      dataSource,
      filter,
      ...nodeListProps
    } = panel;

    return (
      <NodePanel
        {...nodeListProps}
        key={index}
        prompt={prompt}
        stage={stage}
        dataSource={dataSource}
        filter={filter}
        accepts={() => this.isPanelCompatible(index)}
        externalDataSource={dataSource !== 'existing' && dataSource}
        highlight={this.getHighlight(index)}
        minimise={!this.isPanelOpen(index)}
        id={`PANEL_NODE_LIST_${index}`}
        listId={`PANEL_NODE_LIST_${stage.id}_${prompt.id}_${index}`}
        itemType="NEW_NODE"
        onDrop={this.handleDrop}
        onUpdate={(nodeCount, nodeIndex) => this.handlePanelUpdate(index, nodeCount, nodeIndex)}
      />
    );
  }

  render() {
    return (
      <Panels minimise={!this.isAnyPanelOpen()}>
        {this.props.panels.map(this.renderNodePanel)}
      </Panels>
    );
  }
}

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPanelConfiguration = makeGetPanelConfiguration();

  return function mapStateToProps(state, props) {
    const newNodeAttributes = getPromptNodeAttributes(state, props);
    const panels = getPanelConfiguration(state, props);

    return {
      activePromptId: props.prompt.id,
      newNodeAttributes,
      panels,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    removeNodeFromPrompt: bindActionCreators(sessionsActions.removeNodeFromPrompt, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export { NodePanels };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(NodePanels);
