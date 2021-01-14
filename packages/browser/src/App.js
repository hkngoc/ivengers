import React, { Fragment, useState } from 'react';
import Logger from 'js-logger';

import {
  Title,
  Footer,
  Toolbar,
  Main,
  Setting
} from './components';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/background02.jpg';

const App = (props) => {
  const [ showSetting, setShowSetting ] = useState(false);

  Logger.useDefaults();

  return (
    <Fragment>
      <Toolbar
        onSetting={() => setShowSetting(true)}
      />
      <div id="content" className="flex-grow-1">
        <Title />
        <Main />
      </div>
      <Footer />
      <Setting
        show={showSetting}
        onHide={() => setShowSetting(false)}
      />
    </Fragment>
  );
};

export default App;
