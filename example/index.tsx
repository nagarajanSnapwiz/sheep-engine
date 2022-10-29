import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Thing, LogBox2d } from '../.';

const App = () => {
  return (
    <div>
      <Thing />
      <LogBox2d />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
