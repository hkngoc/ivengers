import React, { Fragment } from 'react';

import Main from './Main';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/background02.jpg';
import logo from './assets/logo2.png';

const Title = () => {
  return (
    <div className="text-center">
      <h2>TRAINING STAGE</h2>
      <h5>★ Gờ És Tê C O D E F E S T 2020 ★</h5>
    </div>
  )
}

const Footer = () => {
  return (
    <footer id="sticky-footer">
      <p className="text-center">© 2020 Pê Tê Giê <span><img className="logo" alt="logo" src={logo}/></span></p>
    </footer>
  )
}

const App = () => {
  return (
    <Fragment>
      <div id="content" className="flex-grow-1">
        <Title />
        <Main />
      </div>
      <Footer />
    </Fragment>
  );
}

export default App;
