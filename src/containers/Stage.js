import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import loadInterface from '../utils/loadInterface';
import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stage } from '../selectors/session';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  onClickNext = () => {
    this.props.next();
  }

  // change the stage to the previous
  onClickBack = () => {
    this.props.previous();
  }

  render() {
    const { activeStageConfig } = this.props;
    const CurrentInterface = loadInterface(activeStageConfig.type);

    return (
      <CSSTransitionGroup
        transitionName="stage--transition"
        transitionEnterTimeout={animation.duration.slow * 2}
        transitionLeaveTimeout={animation.duration.slow}
        transitionAppear
        transitionAppearTimeout={animation.duration.slow * 2}
      >
        <div className="stage" key={activeStageConfig.id}>
          <div className="stage__control">
            <button
              className="stage__control-button stage__control-button--back"
              onClick={this.onClickBack}
              id="back-stage"
            >
              Back
            </button>
          </div>
          <div className="stage__interface">
            { CurrentInterface &&
              <CurrentInterface stage={activeStageConfig} />
            }
          </div>
          <div className="stage__control">
            <button
              className="stage__control-button stage__control-button--next"
              onClick={this.onClickNext}
              id="next-stage"
            >
              Next
            </button>
          </div>
        </div>
      </CSSTransitionGroup>
    );
  }
}

Stage.propTypes = {
  activeStageConfig: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  previous: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const activeStageConfig = stage(state);

  return {
    activeStageConfig,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(stageActions.next, dispatch),
    previous: bindActionCreators(stageActions.previous, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);
