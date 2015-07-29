'use strict';

var React = require('react');
var cx = require('classnames');

var Constants = require('./constants.js');

function pluralize(count, word) {
	return count === 1 ? word : word + 's';
}

var TodoFooter = React.createClass({
	render: function () {
		var activeTodoWord = pluralize(this.props.count, 'item');
		var clearButton = null;

		if (this.props.completedCount > 0) {
			clearButton = (
				<button
					className="clear-completed"
					onClick={this.props.onClearCompleted}>
					Clear completed
				</button>
			);
		}

		var nowShowing = this.props.nowShowing;
		return (
			<footer className="footer">
				<span className="todo-count">
					<strong>{this.props.count}</strong> {activeTodoWord} left
				</span>
				<ul className="filters">
					<li>
						<a
							href="#/"
							className={cx({selected: nowShowing === Constants.ALL_TODOS})}>
								All
						</a>
					</li>
					{' '}
					<li>
						<a
							href="#/active"
							className={cx({selected: nowShowing === Constants.ACTIVE_TODOS})}>
								Active
						</a>
					</li>
					{' '}
					<li>
						<a
							href="#/completed"
							className={cx({selected: nowShowing === Constants.COMPLETED_TODOS})}>
								Completed
						</a>
					</li>
				</ul>
				{clearButton}
			</footer>
		);
	}
});

module.exports = TodoFooter;
