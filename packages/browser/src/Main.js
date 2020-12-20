import { Fragment, useEffect, useState } from 'react';
import Gamepad from 'react-gamepad';
import throttle from 'lodash.throttle';

import Machine, { gamepad as GamePad } from '@ivengers/ai';
import Query from './Query';

const KEYS = ['a', 's', 'd', 'w', 'b', 'space', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
const KEYS_MAP_COMMAND = {
  a: '1',
  d: '2',
  w: '3',
  s: '4',
  space: 'b',
  b: 'b',
  arrowleft: '1',
  arrowright: '2',
  arrowup: '3',
  arrowdown: '4'
};
const KEYS_MAP_GAMEPAD = {
  a: 'directionLeft',
  d: 'directionRight',
  w: 'directionUp',
  s: 'directionDown',
  space: 'buttonDown',
  b: 'buttonDown',
  arrowleft: 'directionLeft',
  arrowright: 'directionRight',
  arrowup: 'directionUp',
  arrowdown: 'directionDown'
};

const Main = () => {
  const [ botStatus, setBotStatus ] = useState('idle');
  const [ gamepadStatus, setGamePadStatus ] = useState('idle');

  const [ machine, setMachine ] = useState(null);
  const [ gamepad, setGamepad ] = useState(null);
  const [ keyStatus, setKeyStatus ] = useState({
    directionUp: false,
    directionDown: false,
    directionLeft: false,
    directionRight: false,
    buttonLeft: false,
    buttonUp: false,
    buttonDown: false,
    buttonRight: false,
  });

  const handleKeyDown = (e) => {
    const { key, type } = e;
    if (type !== "keydown") {
      return;
    }

    const lower = key.toLowerCase();
    if (!KEYS.includes(lower)) {
      return;
    }

    // console.log(lower);
    const k = KEYS_MAP_GAMEPAD[lower];

    setKeyStatus({
      ...keyStatus,
      [k]: true
    });

    if (gamepad) {
      gamepad.drive(KEYS_MAP_COMMAND[lower]);
    }
  }

  const handleKeyUp = (e) => {
    const { key, type } = e;
    if (type !== "keyup") {
      return;
    }

    const lower = key.toLowerCase();
    if (!KEYS.includes(lower)) {
      return;
    }

    const k = KEYS_MAP_GAMEPAD[lower];

    setKeyStatus({
      ...keyStatus,
      [k]: false
    });
  }

  const throttled = throttle(handleKeyDown, 50);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', throttled);
      document.addEventListener('keyup', handleKeyUp);
    }

    return function cleanup() {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', throttled);
        document.removeEventListener('keyup', handleKeyUp);
      }
    }
  });

  const handleConnect = async (config) => {
    try {
      const m = new Machine(config);
      await m.connect();
      setMachine(m);
      setBotStatus('connected');
    } catch (e) {
      console.error(e);
    }
  }

  const handleDisconnect = () => {
    if (machine) {
      machine.disconnect();
    }
    setMachine(null);
    setBotStatus('idle');
  }

  const handleGamePadConnect = async (config) => {
    try {
      const m = new GamePad(config);
      await m.connect();
      setGamepad(m);
      setGamePadStatus('connected');
    } catch (e) {
      console.error(e);
    }
  }

  const handleGamePadDisconnect = () => {
    if (gamepad) {
      gamepad.disconnect();
    }
    setGamepad(null);
    setGamePadStatus('idle');
  }

  const onGamePad = (e) => {
    // TODO
    // console.log(e);
  }

  return (
    <Fragment>
      <div className="d-flex justify-content-around">
        <Query
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          status={botStatus}
        />
        <Gamepad
          onButtonChange={onGamePad}
          onAxisChange={onGamePad}
        >
          <Query
            onConnect={handleGamePadConnect}
            onDisconnect={handleGamePadDisconnect}
            status={gamepadStatus}
            keyStatus={keyStatus}
            gamepad={true}
          />
        </Gamepad>
      </div>
    </Fragment>
  );
}

export default Main;
