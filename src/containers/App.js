import React, { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import cx from 'classnames';
import 'swiper/css/swiper.css';
import { actionCreators as deviceSettingsActions } from '../ducks/modules/deviceSettings';
import '../styles/main.scss';
import {
  isElectron, isWindows, isMacOS, isLinux, isPreview, getEnv, isIOS, isAndroid,
} from '../utils/Environment';
import DialogManager from '../components/DialogManager';
import ToastManager from '../components/ToastManager';
import { SettingsMenu } from '../components/SettingsMenu';
import useUpdater from '../hooks/useUpdater';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';

const getElectronWindow = () => {
  if (isElectron()) {
    const electron = window.require('electron'); // eslint-disable-line global-require
    return electron.remote.getCurrentWindow();
  }
  return false;
};

const list = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
    },
  },
  hidden: {
    opacity: 0,
  },
};

/**
  * Main app container.
  * @param props {object} - children
  */
const App = ({
  startFullScreen,
  setStartFullScreen,
  interfaceScale,
  useDynamicScaling,
  crappleWarningHeeded,
  setCrappleWarningHeeded,
  children,
  openDialog,
}) => {
  const win = useMemo(() => getElectronWindow(), []);
  const env = useMemo(() => getEnv(), []);

  const setFontSize = useCallback(() => {
    const root = document.documentElement;
    const newFontSize = useDynamicScaling
      ? `${(1.65 * interfaceScale) / 100}vmin`
      : `${(16 * interfaceScale) / 100}px`;

    root.style.setProperty('--base-font-size', newFontSize);
  }, [useDynamicScaling, interfaceScale]);

  useUpdater('https://api.github.com/repos/complexdatacollective/Interviewer/releases/latest', 2500);

  useEffect(() => {
    if (isIOS()) {
      // Enable viewport shrinking on iOS to mirror behaviour on android.
      window.Keyboard.shrinkView(true);
    }
  }, []);

  useEffect(() => {
    // Ugh.
    if ((isIOS()) && !crappleWarningHeeded) {
      openDialog({
        type: 'Confirm',
        title: 'Important requirements specific to iPad users',
        message: (
          <>
            <p>
              By using this app you confirm that you have submitted documents
              to us that demonstrate compliance with all App Store policies regarding
              human subjects research (including proof of full IRB or ethics board approval), and
              have been formally approved by us (CODACO) to use this software for your specific
              research,
              {' '}
              <strong>
                and your specific research only
              </strong>
              . You also confirm that you will inform us immediately of
              any changes to your IRB status that might impact our approval.
            </p>
          </>
        ),
        confirmLabel: 'I confirm the above',
        canCancel: false,
        onConfirm: setCrappleWarningHeeded,
      });
    }
  }, [crappleWarningHeeded]);

  useEffect(() => {
    if (!env.REACT_APP_NO_FULLSCREEN) {
      // Spy on window fullscreen status
      if (isElectron() && !isPreview()) {
        win.setFullScreen(!!startFullScreen);

        win.on('enter-full-screen', () => {
          if (startFullScreen) { return; }
          setStartFullScreen(true);
        });

        // For some reason, this fires when the window loses focus (when
        // switching workspaces) on linux.
        win.on('leave-full-screen', () => {
          if (!startFullScreen) { return; }

          setStartFullScreen(false);
        });
      }
    }

    return () => {
      if (win) {
        win.removeAllListeners();
      }
    };
  }, [win, startFullScreen, setStartFullScreen]);

  setFontSize();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={list}
      className={cx({
        app: true,
        'app--electron': isElectron(),
        'app--windows': isWindows(),
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        'app--macos': isMacOS(),
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        'app--ios': isIOS(),
        'app-android': isAndroid(),
        'app--linux': isLinux(),
        'app--preview': isPreview(),
      })}
    >
      <div className="electron-titlebar" />
      <div
        id="page-wrap"
        className={cx({
          app__content: true,
        })}
      >
        <SettingsMenu />
        { children }
      </div>
      <DialogManager />
      <ToastManager />
    </motion.div>
  );
};

App.propTypes = {
  children: PropTypes.any,
  interfaceScale: PropTypes.number.isRequired,
  useDynamicScaling: PropTypes.bool.isRequired,
  startFullScreen: PropTypes.bool.isRequired,
  setStartFullScreen: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null,
};

const mapDispatchToProps = (dispatch) => ({
  setStartFullScreen: (value) => dispatch(deviceSettingsActions.setSetting('startFullScreen', value)),
  setCrappleWarningHeeded: () => dispatch(deviceSettingsActions.setSetting('crappleWarningHeeded', true)),
  openDialog: (dialog) => dispatch(dialogActions.openDialog(dialog)),
});

function mapStateToProps(state) {
  return {
    interfaceScale: state.deviceSettings.interfaceScale,
    useDynamicScaling: state.deviceSettings.useDynamicScaling,
    startFullScreen: state.deviceSettings.startFullScreen,
    crappleWarningHeeded: state.deviceSettings.crappleWarningHeeded,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(App);
