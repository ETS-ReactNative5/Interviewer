import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import PropTypes from 'prop-types';
import { pick, map } from 'lodash';
import { createSelector } from 'reselect';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Form } from '../../containers/Elements';
import { Modal } from '../../components/Elements';
import { makeRehydrateFields } from '../../selectors/rehydrate';

const propNode = (_, props) => props.node;

const makePropFieldVariables = () =>
  createSelector(
    makeRehydrateFields(),
    fields => map(fields, 'name'),
  );

const makeGetInitialValuesFromProps = () =>
  createSelector(
    makePropFieldVariables(),
    propNode,
    (fields, node) => pick(node, fields),
  );

/**
  * Modal Node Form, than can handle new/editing of nodes
  * @extends Component
  */
class NodeForm extends Component {
  onSubmit = (formData, dispatch, form) => {
    this.props.closeModal(this.props.name);
    this.props.handleSubmit(formData, dispatch, form);
    if (this.state.typeOfSubmit === 'continuous') {
      this.props.resetValues(form.name);
      this.props.openModal(this.props.name);
    }
  };

  continuousSubmit = () => {
    this.setState({
      typeOfSubmit: 'continuous',
    }, this.submit);
  };

  normalSubmit = () => {
    this.setState({
      typeOfSubmit: 'normal',
    }, this.submit);
  };

  render() {
    const {
      title,
      fields,
      name,
      addAnother,
      initialValues,
    } = this.props;

    return (
      <Modal name={name} title={title}>
        <Form
          fields={fields}
          initialValues={!addAnother ? initialValues : null}
          autoFocus
          form={name.toString()}
          onSubmit={this.onSubmit}
          addAnother={addAnother}
          continuousSubmit={this.continuousSubmit}
          normalSubmit={this.normalSubmit}
        />
      </Modal>
    );
  }
}

NodeForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  resetValues: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  title: PropTypes.string.isRequired,
  fields: PropTypes.array.isRequired,
  node: PropTypes.any, // eslint-disable-line react/no-unused-prop-types
  addAnother: PropTypes.bool,
};

NodeForm.defaultProps = {
  addAnother: false,
  node: {},
};

function makeMapStateToProps() {
  const getInitialValuesFromProps = makeGetInitialValuesFromProps();

  return function mapStateToProps(state, props) {
    return {
      initialValues: getInitialValuesFromProps(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    resetValues: bindActionCreators(reset, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeForm);
