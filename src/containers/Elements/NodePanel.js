import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEqual, isMatch } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { makeGetProviderNodes } from '../../selectors/node-provider';
import NodeList from '../../components/Elements/NodeList';

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodePanel extends Component {
  static propTypes = {
    newNodeAttributes: PropTypes.object.isRequired,
    activePromptAttributes: PropTypes.object.isRequired,
    nodes: PropTypes.array.isRequired,
    nodeColor: PropTypes.string,
    interaction: PropTypes.string.isRequired,
    addOrUpdateNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired,
    toggleNodeAttributes: PropTypes.func.isRequired,
    onUpdateNodes: PropTypes.func,
    onDrag: PropTypes.func,
    currentIds: PropTypes.object.isRequired,
  };

  static defaultProps = {
    nodeColor: null,
    onUpdateNodes: () => {},
    onDrag: () => {},
  };

  componentDidMount() {
    this.props.onUpdateNodes(this.props.nodes);
  }

  componentWillReceiveProps(props) {
    if (!isEqual(props.nodes, this.props.nodes)) {
      this.props.onUpdateNodes(props.nodes);
    }
  }

  onSelectNode = (node) => {
    this.props.toggleNodeAttributes(node, this.props.activePromptAttributes);
  }

  onDropNode = (hits, node) => {
    hits.forEach((hit) => {
      switch (hit.name) {
        case 'MAIN_NODE_LIST':
          this.props.addOrUpdateNode({ ...this.props.newNodeAttributes, ...node });
          break;
        case 'NODE_BIN':
          this.props.removeNode(node.uid);
          break;
        default:
      }
    });
  }

  getNodeListProps() {
    const {
      activePromptAttributes,
      currentIds,
      interaction,
      nodes,
      nodeColor,
      onDrag,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, activePromptAttributes);

    const defaultProps = {
      activePromptAttributes,
      interaction,
      currentIds,
      handleDropNode: this.onDropNode,
      label,
      nodes,
      nodeColor,
      onDrag,
      onSelectNode: this.onSelectNode,
    };

    switch (interaction) {
      case 'selectable':
        return {
          ...defaultProps,
          draggableType: 'EXISTING_NODE',
          selected,
        };
      case 'droppable':
        return {
          ...defaultProps,
          draggableType: 'NEW_NODE',
          droppableName: 'NODE_PROVIDER',
          acceptsDraggableType: 'EXISTING_NODE',
        };
      default:
        return {
          ...defaultProps,
          draggableType: 'NEW_NODE',
        };
    }
  }

  render() {
    return (
      <NodeList
        {...this.getNodeListProps()}
      />
    );
  }
}

function makeMapStateToProps() {
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const getProviderNodes = makeGetProviderNodes();

  return function mapStateToProps(state, props) {
    const currentIds = { promptId: props.prompt.id, stageId: props.stage.id };

    const interaction = (props.selectable && 'selectable') ||
      (props.draggable && 'draggable') ||
      (props.droppable && 'droppable') ||
      'none';

    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodes: getProviderNodes(state, props),
      currentIds,
      interaction,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addOrUpdateNode: bindActionCreators(networkActions.addOrUpdateNode, dispatch),
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodePanel);
