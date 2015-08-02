import React from 'react/addons';
import moment from 'moment';

export const ChatMessage = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  render() {
    const {curUserId, userId, body, createdAt} = this.props;
    return (
      <div className={'message ' + (userId === curUserId ? 'to' : 'from')}>
        <div className="messageSender">
          {userId}
        </div>
        <div className="messageBody">
          {body}
          <div className="timestamp">
            {moment(createdAt).calendar()}
          </div>
        </div>
      </div>
    );
  },
});
