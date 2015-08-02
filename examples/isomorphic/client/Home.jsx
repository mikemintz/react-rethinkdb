import React from 'react';
import {r, QueryRequest, PropsMixin as RethinkMixin} from 'react-rethinkdb';

export const Home = React.createClass({
  mixins: [RethinkMixin('rethinkSession')],

  observe(props, state) {
    const query = r.table('turtles');
    return {
      turtles: new QueryRequest({query, changes: true, initial: []}),
    };
  },

  render() {
    const errors = this.data.turtles.errors();
    const turtles = this.data.turtles.value();
    return (
      <div>
        {errors.length > 0 && errors.map((error, index) => (
          <pre key={index}>Error: {error}</pre>
        ))}
        <ul>
          {errors.length === 0 && turtles.map(turtle => (
            <li key={turtle.id}>
              Turtle: {turtle.name}
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
