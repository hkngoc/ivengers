import { useEffect, useState } from 'react';

import Gamepad from 'react-gamepad';
import throttle from 'lodash.throttle';

import Machine, { gamepad as GamePad } from '@ivengers/ai';
import Query from './Query';

import {
  KEYS,
  KEYS_MAP_COMMAND,
  KEYS_MAP_GAMEPAD
} from './constant';

const Main = (props) => {
  const [ status, setStatus ] = useState({
    green:'idle',
    gamepad: 'idle',
    red: 'idle'
  });
  const [ ai, setAi ] = useState({
    green: null,
    gamepad: null,
    red: null
  });

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

    if (ai["gamepad"]) {
      ai["gamepad"].drive(KEYS_MAP_COMMAND[lower]);
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

  const handleConnect = async (who, config) => {
    const Classes = ["green", "red"].includes(who) ? Machine : GamePad;

    try {
      const m = new Classes(config);
      await m.connect();
      setAi({ ...ai, [who]: m });
      setStatus({ ...status, [who]: 'connected' });
    } catch (e) {
      console.error(e);
    }
  }

  const handleDisconnect = (who) => {
    const machine = ai[who];
    if (machine) {
      machine.disconnect();
    }
    setAi({ ...ai, [who]: null });
    setStatus({ ...status, [who]: 'idle' });
  }

  const onGamePad = (e) => {
    // TODO
    // console.log(e);
  }

  return (
    <div className="d-flex flex-wrap justify-content-center">
      <Query
        onConnect={handleConnect.bind(this, "green")}
        onDisconnect={handleDisconnect.bind(this, "green")}
        status={status["green"]}
      />
      <Gamepad
        onButtonChange={onGamePad}
        onAxisChange={onGamePad}
      >
        <Query
          onConnect={handleConnect.bind(this, "gamepad")}
          onDisconnect={handleDisconnect.bind(this, "gamepad")}
          status={status["gamepad"]}
          keyStatus={keyStatus}
          gamepad={true}
        />
      </Gamepad>
      <Query
        onConnect={handleConnect.bind(this, "red")}
        onDisconnect={handleDisconnect.bind(this, "red")}
        status={status["red"]}
        playerRed={true}
      />
    </div>
  );
}

export default Main;
