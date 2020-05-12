import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { SessionCard } from '../../components';
import { getLastActiveSession } from '../../selectors/session';

const NewInterviewSection = (props) => {
  const {
    sessions,
    lastActiveSession,
    showSessionsOverlay,
  } = props;

  const ResumeOtherSessionLabel = `+${Object.keys(sessions).length - 1} Other Interview${Object.keys(sessions).length - 1 > 1 ? 's' : ''}...`;

  return (
    <React.Fragment>
      {Object.keys(sessions).length > 0 && (
        <section className="setup-section resume-section">
          <main className="section-wrapper">
            <section className="setup-section__content">
              <header>
                <h1>Resume an Interview</h1>
                <h3>Last Active Interview...</h3>
              </header>
              <SessionCard
                sessionUUID={lastActiveSession.sessionUUID}
                attributes={lastActiveSession.attributes}
              />
            </section>
            { Object.keys(sessions).length > 1 && (
              <aside className="setup-section__action">
                <h4>Manage All Interviews</h4>
                <div className="resume-card" onClick={showSessionsOverlay}>
                  <h3>{ResumeOtherSessionLabel}</h3>
                </div>
              </aside>
            )}
          </main>
        </section>
      )}
    </React.Fragment>
  );
};

NewInterviewSection.propTypes = {
};

NewInterviewSection.defaultProps = {
};

function mapStateToProps(state) {
  return {
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showSessionsOverlay: () => dispatch(uiActions.update({ showSessionsOverlay: true })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewInterviewSection);

export { NewInterviewSection as UnconnectedNewInterviewSection };
