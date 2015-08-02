import React from 'react';
import moment from 'moment';
import {r, QueryRequest, DefaultMixin as RethinkMixin} from 'react-rethinkdb';
import {AutoScrollDown} from './AutoScrollDown.jsx';
import {ChatMessage} from './ChatMessage.jsx';
import {SendMessageForm} from './SendMessageForm.jsx';

export const ChatBox = React.createClass({
  mixins: [RethinkMixin],

  getInitialState() {
    return {mountTime: moment()};
  },

  observe(props, state) {
    const startTime = moment(state.mountTime).subtract(1, 'day').toDate();
    const query = r.table('messages')
                   .orderBy({index: 'createdAt'})
                   .filter(r.row('createdAt').ge(startTime));
    return {
      messages: new QueryRequest({query, changes: true, initial: []}),
    };
  },

  render() {
    return (
      <div className="chatboxOuter">
        <div className="chatboxScrollbox">
          <AutoScrollDown>
            {this.data.messages.value().map(message => (
              <ChatMessage
                key={message.id}
                curUserId={this.props.curUserId}
                userId={message.userId}
                body={message.body}
                createdAt={message.createdAt}
              />
            ))}
          </AutoScrollDown>
        </div>
        <SendMessageForm curUserId={this.props.curUserId} />
      </div>
    );
  },
});
