'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var director = require('director');
var ReactRethinkdb = require('react-rethinkdb');

var r = ReactRethinkdb.r;
var RethinkSession = ReactRethinkdb.DefaultSession;

var Constants = require('./constants.js');
var TodoFooter = require('./footer.jsx');
var TodoItem = require('./todoItem.jsx');

var TodoApp = React.createClass({
	mixins: [ReactRethinkdb.DefaultMixin],

	observe(props, state) {
		return {
			todos: new ReactRethinkdb.QueryRequest({
				query: r.table('todos').orderBy({index: 'createdAt'}),
				changes: true,
				initial: []
			}),
		};
	},

	getInitialState: function () {
		return {
			nowShowing: Constants.ALL_TODOS,
			editing: null
		};
	},

	componentDidMount: function () {
		var setState = this.setState;
		var router = director.Router({
			'/': setState.bind(this, {nowShowing: Constants.ALL_TODOS}),
			'/active': setState.bind(this, {nowShowing: Constants.ACTIVE_TODOS}),
			'/completed': setState.bind(this, {nowShowing: Constants.COMPLETED_TODOS})
		});
		router.init('/');
	},

	handleNewTodoKeyDown: function (event) {
		if (event.keyCode !== Constants.ENTER_KEY) {
			return;
		}

		event.preventDefault();

		var val = this.refs.newField.value.trim();

		if (val) {
			var q = r.table('todos').insert({title: val, completed: false, createdAt: r.now()});
			RethinkSession.runQuery(q);
			this.refs.newField.value = '';
		}
	},

	toggleAll: function (event) {
		var checked = event.target.checked;
		var q = r.table('todos').update({completed: checked});
		RethinkSession.runQuery(q);
	},

	toggle: function (todoToToggle) {
		var q = r.table('todos').get(todoToToggle.id).update({completed: r.row('completed').not()});
		RethinkSession.runQuery(q);
	},

	destroy: function (todo) {
		var q = r.table('todos').get(todo.id).delete();
		RethinkSession.runQuery(q);
	},

	edit: function (todo) {
		this.setState({editing: todo.id});
	},

	save: function (todoToSave, text) {
		var q = r.table('todos').get(todoToSave.id).update({title: text});
		RethinkSession.runQuery(q);
		this.setState({editing: null});
	},

	cancel: function () {
		this.setState({editing: null});
	},

	clearCompleted: function () {
		var q = r.table('todos').filter({completed: true}).delete();
		RethinkSession.runQuery(q);
	},

	render: function () {
		var footer;
		var main;
		var todos = this.data.todos.value();

		var shownTodos = todos.filter(function (todo) {
			switch (this.state.nowShowing) {
				case Constants.ACTIVE_TODOS:
					return !todo.completed;
				case Constants.COMPLETED_TODOS:
					return todo.completed;
				default:
					return true;
			}
		}, this);

		var todoItems = shownTodos.map(function (todo) {
			return (
				<TodoItem
					key={todo.id}
					todo={todo}
					onToggle={this.toggle.bind(this, todo)}
					onDestroy={this.destroy.bind(this, todo)}
					onEdit={this.edit.bind(this, todo)}
					editing={this.state.editing === todo.id}
					onSave={this.save.bind(this, todo)}
					onCancel={this.cancel}
				/>
			);
		}, this);

		var activeTodoCount = todos.reduce(function (accum, todo) {
			return todo.completed ? accum : accum + 1;
		}, 0);

		var completedCount = todos.length - activeTodoCount;

		if (activeTodoCount || completedCount) {
			footer =
				<TodoFooter
					count={activeTodoCount}
					completedCount={completedCount}
					nowShowing={this.state.nowShowing}
					onClearCompleted={this.clearCompleted}
				/>;
		}

		if (todos.length) {
			main = (
				<section className="main">
					<input
						className="toggle-all"
						type="checkbox"
						onChange={this.toggleAll}
						checked={activeTodoCount === 0}
					/>
					<ul className="todo-list">
						{todoItems}
					</ul>
				</section>
			);
		}

		return (
			<div>
				<header className="header">
					<h1>todos</h1>
					<input
						ref="newField"
						className="new-todo"
						placeholder="What needs to be done?"
						onKeyDown={this.handleNewTodoKeyDown}
						autoFocus={true}
					/>
				</header>
				{main}
				{footer}
			</div>
		);
	}
});

var secure = window.location.protocol === 'https:';
RethinkSession.connect({
	host: window.location.hostname,
	port: window.location.port || (secure ? 443 : 80),
	path: '/db',
	secure: secure,
	db: 'react_example_todomvc',
});

function render() {
	ReactDOM.render(
		<TodoApp />,
		document.getElementsByClassName('todoapp')[0]
	);
}

render();
