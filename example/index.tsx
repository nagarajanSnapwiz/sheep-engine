import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Thing, LogBox2d, Box2dWorld } from '../.';


const App = () => {
  return (
    <div>
      <Thing />
      <LogBox2d />
      
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

