import React from 'react';
import ReactDOM from 'react-dom';

// http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
export const AutoScrollDown = React.createClass({
  componentWillUpdate() {
    const node = ReactDOM.findDOMNode(this);
    const d = node.scrollHeight - node.scrollTop - node.offsetHeight;
    this.shouldScrollBottom = d <= 20;
  },

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  },

  render() {
    return (
      <div className="autoScrollDown">
        {this.props.children}
      </div>
    );
  },
});
