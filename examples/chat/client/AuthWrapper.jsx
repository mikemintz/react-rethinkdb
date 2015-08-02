import React from 'react';
import request from 'superagent';
import {DefaultSession as RethinkSession} from 'react-rethinkdb';
import {ChatBox} from './ChatBox.jsx';

export const AuthWrapper = React.createClass({
  getInitialState() {
    return {
      userId: window.localStorage.getItem('userId'),
      error: false,
    };
  },

  componentWillMount() {
    if (this.state.userId) {
      this.connect();
    }
  },

  connect() {
    const userId = window.localStorage.getItem('userId');
    const authToken = window.localStorage.getItem('authToken');
    const path = '/db'
               + '?userId=' + encodeURIComponent(userId)
               + '&authToken=' + encodeURIComponent(authToken);
    const secure = window.location.protocol === 'https:';
    RethinkSession.connect({
      host: window.location.hostname,
      port: window.location.port || (secure ? 443 : 80),
      path: path,
      secure: secure,
      db: 'react_example_chat',
    });
  },

  handleButton(action, event) {
    event.preventDefault();
    const uri = {'login': '/login', 'signup': '/signup'}[action];
    const userId = React.findDOMNode(this.refs.userId).value;
    const password = React.findDOMNode(this.refs.password).value;
    this.setState({error: false});
    request
    .post(uri)
    .query({userId, password})
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        this.setState({error: true});
      } else {
        const {authToken} = res.body;
        window.localStorage.setItem('userId', userId);
        window.localStorage.setItem('authToken', authToken);
        this.connect();
        this.setState({userId});
      }
    });
  },

  handleLogout() {
    RethinkSession.close();
    this.setState({userId: null});
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('authToken');
  },

  renderLoggedIn() {
    return (
      <div className="contentOuter">
        <div className="logoutBar">
          <button type="button" onClick={this.handleLogout}>
            Logout
          </button>
        </div>
        <div className="contentInner">
          <ChatBox curUserId={this.state.userId} />
        </div>
      </div>
    );
  },

  renderLoggedOut() {
    return (
      <div className="loggedOut">
        {this.state.error && <div>Authentication error</div>}
        <input type="text" placeholder="Username" ref="userId" autoFocus={true} />
        <input type="text" placeholder="Password" ref="password" />
        <button type="button" onClick={this.handleButton.bind(this, 'login')}>
          Login
        </button>
        <button type="button" onClick={this.handleButton.bind(this, 'signup')}>
          Signup
        </button>
      </div>
    );
  },

  render() {
    if (this.state.userId) {
      return this.renderLoggedIn();
    } else {
      return this.renderLoggedOut();
    }
  },
});
