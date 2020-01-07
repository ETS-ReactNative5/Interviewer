import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { throttle } from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Flipper } from 'react-flip-toolkit';
import cx from 'classnames';
import { getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable } from '../selectors/interface';
import { makeGetNodeLabel } from '../selectors/network';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { CategoricalItem } from '../components/';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getEntityAttributes, entityAttributesProperty, entityPrimaryKeyProperty } from '../ducks/modules/network';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';

const getIsPortrait = (width, height) =>
  width / height < 1;

const getExpandedSize = bounds => (
  bounds.height > (bounds.width * 0.67) ?
    Math.floor(bounds.width * 0.67) :
    bounds.height
);

const getItemSize = (bounds, itemCount, expanded = false) => {
  const expandedSize = getExpandedSize(bounds);

  const width = expanded ? bounds.width - expandedSize : bounds.width;

  const isPortrait = getIsPortrait(width, bounds.height);

  const unexpandedItemCount = expanded ? itemCount - 1 : itemCount;

  const shortCount = [4, 5, 6, 7, 8].includes(unexpandedItemCount) ? 2 : 1;
  const longCount = shortCount > 1 ? Math.ceil(unexpandedItemCount / 2) : unexpandedItemCount;

  const longSide = isPortrait ? bounds.height : width;
  const shortSide = isPortrait ? width : bounds.height;

  const x = Math.floor(longSide / longCount);
  const y = Math.floor(shortSide / shortCount);
  const z = x < y ? x : y;

  return z;
};

/**
  * CategoricalList: Renders a list of categorical bin items
  */
class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.categoricalListElement = React.createRef();
  }

  componentWillMount() {
    this.colorPresets = [
      getCSSVariableAsString('--cat-color-seq-1'),
      getCSSVariableAsString('--cat-color-seq-2'),
      getCSSVariableAsString('--cat-color-seq-3'),
      getCSSVariableAsString('--cat-color-seq-4'),
      getCSSVariableAsString('--cat-color-seq-5'),
      getCSSVariableAsString('--cat-color-seq-6'),
      getCSSVariableAsString('--cat-color-seq-7'),
      getCSSVariableAsString('--cat-color-seq-8'),
      getCSSVariableAsString('--cat-color-seq-9'),
      getCSSVariableAsString('--cat-color-seq-10'),
    ];
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = throttle(() => {
    this.forceUpdate();
  }, 1000 / 60);

  getDetails = (nodes) => {
    if (nodes.length === 0) {
      return '';
    }

    // todo: the following should be updated to reflect the sort order of the bins
    const name = this.props.getLabel(nodes[0]);

    if (nodes.length > 0) {
      return `${name}${nodes.length > 1 ? ` and ${nodes.length - 1} other${nodes.length > 2 ? 's' : ''}` : ''}`;
    }

    return '';
  };

  getSizes = () => {
    if (!this.categoricalListElement.current) {
      return [];
    }

    const categoricalListElement = this.categoricalListElement.current;

    const bounds = getAbsoluteBoundingRect(categoricalListElement);

    const expandedSize = getExpandedSize(bounds);
    const itemSize = getItemSize(
      bounds,
      this.props.bins.length,
      !!this.props.expandedBinValue,
    );

    return {
      expandedSize,
      itemSize,
    };
  };

  getCatColor = (itemNumber) => {
    if (itemNumber >= 0) { return this.colorPresets[itemNumber % this.colorPresets.length]; }
    return null;
  };

  handleExpandBin = (e, binValue) => {
    if (e) e.stopPropagation();

    this.props.onExpandBin(binValue);
  }

  handleDrop = ({ meta }, binValue) => {
    if (getEntityAttributes(meta)[this.props.activePromptVariable] === [binValue]) {
      return;
    }

    this.props.updateNode(
      meta[entityPrimaryKeyProperty],
      {},
      { [this.props.activePromptVariable]: [binValue] },
    );
  };

  renderCategoricalBin = (bin, index, sizes) => {
    const binDetails = this.getDetails(bin.nodes);

    const itemSize = bin.value === this.props.expandedBinValue ?
      { width: `${sizes.expandedSize}px`, height: `${sizes.expandedSize}px` } :
      { width: `${sizes.itemSize}px`, height: `${sizes.itemSize}px` };

    return (
      <div
        className="categorical-list__item"
        style={itemSize}
        key={bin.value}
        onClick={this.handleExpandBin}
      >
        <CategoricalItem
          id={`CATBIN_ITEM_${this.props.stage.id}_${this.props.prompt.id}_${bin.value}`}
          key={bin.value}
          label={bin.label}
          accentColor={this.getCatColor(index)}
          onDrop={item => this.handleDrop(item, bin.value)}
          onClick={e => this.handleExpandBin(e, bin.value)}
          details={binDetails}
          isExpanded={this.props.expandedBinValue === bin.value}
          nodes={bin.nodes}
          sortOrder={this.props.prompt.binSortOrder}
        />
      </div>
    );
  }

  render() {
    const listClasses = cx(
      'categorical-list',
      `categorical-list--items--${this.props.bins.length}`,
      { 'categorical-list--expanded': this.props.expandedBinValue },
    );

    const sizes = this.getSizes();

    // Render before filter, because we need to preserve order for colors.
    const categoricalBins = this.props.bins
      .map((bin, index) => this.renderCategoricalBin(bin, index, sizes));

    const expandedBin = categoricalBins
      .filter((bin, index) =>
        this.props.bins[index].value === this.props.expandedBinValue,
      );

    const otherBins = categoricalBins
      .filter((bin, index) =>
        this.props.bins[index].value !== this.props.expandedBinValue,
      );

    return (
      <div
        className={listClasses}
        ref={this.categoricalListElement}
        onClick={this.handleExpandBin}
      >
        <Flipper
          flipKey={this.props.expandedBinValue}
          className="categorical-list__items"
        >
          {expandedBin}
          {otherBins}
        </Flipper>
      </div>
    );
  }
}

CategoricalList.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  bins: PropTypes.array.isRequired,
  getLabel: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
  expandedBinValue: PropTypes.string.isRequired,
  onExpandBin: PropTypes.func.isRequired,
};

CategoricalList.defaultProps = {
  isDragging: false,
  meta: {},
};

function makeMapStateToProps() {
  const getCategoricalValues = makeGetVariableOptions();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForType();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);
    const getNodeLabel = makeGetNodeLabel();

    return {
      activePromptVariable,
      bins: getCategoricalValues(state, props)
        .map((bin) => {
          const nodes = stageNodes.filter(
            node =>
              node[entityAttributesProperty][activePromptVariable] &&
              node[entityAttributesProperty][activePromptVariable].includes(bin.value),
          );

          return {
            ...bin,
            nodes,
          };
        }),
      getLabel: getNodeLabel(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export { CategoricalList as UnconnectedCategoricalList };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(CategoricalList);
