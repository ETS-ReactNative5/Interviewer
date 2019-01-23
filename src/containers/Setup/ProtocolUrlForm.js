import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Form from '../Form';
import { Button, Icon } from '../../ui/components';
import { actionCreators as protocolActions } from '../../ducks/modules/protocols';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      component: 'Text',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://',
};

class ProtocolUrlForm extends Component {
  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.installProtocol(fields.protocol_url);
      // return to start
      // this.props.handleProtocolUpdate();
    }
  }

  render() {
    const { onCancel } = this.props;
    return (
      <Form
        className="protocol-url-form"
        form={formConfig.formName}
        onSubmit={this.onClickImportRemoteProtocol}
        initialValues={initialValues}
        controls={[
          <Button
            onClick={onCancel}
            key="cancel"
            color="platinum"
            icon={<Icon name="close" />}
            content="Cancel"
            type="button"
          />,
          <Button key="submit" type="submit">Import remote protocol</Button>,
        ]}
        {...formConfig}
      />
    );
  }
}

ProtocolUrlForm.propTypes = {
  installProtocol: PropTypes.func.isRequired,
  handleProtocolUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    installProtocol: bindActionCreators(protocolActions.installProtocol, dispatch),
    handleProtocolUpdate: () => {
      dispatch(push('/'));
    },
  };
}

export default connect(null, mapDispatchToProps)(ProtocolUrlForm);
