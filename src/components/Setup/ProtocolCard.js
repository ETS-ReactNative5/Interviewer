import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as installedProtocolsActions } from '../../ducks/modules/installedProtocols';
import { Icon } from '../../ui/components';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../../config';

const ProtocolCard = ({ protocol, openDialog, deleteProtocol, selectProtocol }) => {
  const isOutdatedProtocol = () =>
    protocol.schemaVersion !== APP_SCHEMA_VERSION &&
    APP_SUPPORTED_SCHEMA_VERSIONS.includes(protocol.schemaVersion);

  const isObsoleteProtocol = () => false; // To be implemented in future, as needed.

  const handleDeleteProtocol = () => {
    deleteProtocol(protocol.uuid);
  };

  const handleSchemaOutdatedInfo = () => {
    openDialog({
      type: 'Warning',
      title: 'Out of Date Schema',
      canCancel: false,
      message: (
        <React.Fragment>
          <p>
            This protocol uses an older version of the protocol file format, or &quot;schema&quot;.
          </p>
          <p>
            Newer schema versions support additional features in Network Canvas, and may be
            required in order to use this protocol in the future. To avoid losing the ability
            to conduct interviews, you are strongly advised to migrate this protocol to the
            latest schema version. To do this, open the protocol file it in the latest version
            of Architect, and follow the migration instructions. Once migrated, install the
            new version of the protocol on this device.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
          <p>
            In the meantime, you can continue to use this protocol to start interviews or
            export data.
          </p>
        </React.Fragment>
      ),
    });
  };

  const handleSchemaObsoleteInfo = () => {
    openDialog({
      type: 'Error',
      title: 'Obsolete Protocol Schema',
      canCancel: false,
      message: (
        <React.Fragment>
          <p>
            This protocol uses an obsolete version of the protocol file format, or
            &quot;schema&quot;.
          </p>
          <p>
            The version of the schema used by this protocol is incompatible with this version of
            Network Canvas. You may still export interview data that has already been collected,
            but you may not start additional interviews.
          </p>
          <p>
            If you require the ability to start interviews, you can either (1) install an updated
            version of this protocol that uses the latest schema, or (2) downgrade your version
            of Network Canvas to a version that supports this protocol schema version.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
        </React.Fragment>
      ),
    });
  };

  const modifierClasses = cx(
    'protocol-card',
    { 'protocol-card--warning': !isObsoleteProtocol() && isOutdatedProtocol() },
    { 'protocol-card--error': isObsoleteProtocol() },
  );

  const renderCardIcon = () => {
    const iconMarkup = isOutdatedProtocol() ?
      (
        <div className="protocol-card__warning" onClick={handleSchemaOutdatedInfo}>
          <Icon name="warning" />
        </div>) :
      (
        <div className="protocol-card__error" onClick={handleSchemaObsoleteInfo}>
          <Icon name="error" />
        </div>
      );

    return iconMarkup;
  };

  return (
    <div className={modifierClasses}>
      <div className="protocol-card__delete" onClick={handleDeleteProtocol}>
        <Icon name="delete" />
      </div>
      {
        isOutdatedProtocol() || isObsoleteProtocol() ?
          renderCardIcon() : ''
      }
      <h2 className="protocol-card__name">{protocol.name}</h2>
      <p className="protocol-card__description">
        { protocol.description ?
          protocol.description : (<em>No protocol description.</em>)}
      </p>
      <div
        className={isObsoleteProtocol() ? ('start-button start-button--disabled') : ('start-button')}
        onClick={() => selectProtocol(protocol)}
      >
        <Icon className="start-button__protocol-icon" name="protocol-card" />
        <div className="start-button__text">Start new interview</div>
        <Icon className="start-button__arrow" name="chevron-right" />
      </div>
    </div>
  );
};

ProtocolCard.defaultProps = {
  className: '',
  selectProtocol: () => {},
  description: null,
};

ProtocolCard.propTypes = {
  selectProtocol: PropTypes.func,
  openDialog: PropTypes.func.isRequired,
  deleteProtocol: PropTypes.func.isRequired,
  protocol: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
  deleteProtocol: installedProtocolsActions.deleteProtocol,
};

export { ProtocolCard as UnconnectedProtocolCard };

export default connect(null, mapDispatchToProps)(ProtocolCard);
