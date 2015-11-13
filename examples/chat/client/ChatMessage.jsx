import React from 'react';
import moment from 'moment';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export const ChatMessage = React.createClass({
  mixins: [PureRenderMixin],

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
