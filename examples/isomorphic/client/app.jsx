import React from 'react';
import ReactDOM from 'react-dom';
import {Session as RethinkSession} from 'react-rethinkdb';
import {Home} from './Home.jsx';

const rethinkSession = new RethinkSession();
rethinkSession.connect({host: 'localhost', port: 8015, path: '/db', secure: false});

const mountNode = document.getElementById('app');
const elem = <Home rethinkSession={rethinkSession} />;
ReactDOM.render(elem, mountNode);
