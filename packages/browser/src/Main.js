import { Fragment, useState } from 'react';
import Query from './Query';

import {
  Machine
} from '@test/hostp';

const Main = () => {
  const [ status, setStatus ] = useState('idle');
  const [ machine, setMachine ] = useState(null);

  const handleConnect = async (config) => {
    try {
      const m = new Machine(config);
      await m.connect();
      setMachine(m);
      setStatus('connected');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = () => {
    if (machine) {
      machine.disconnect();
    }
    setMachine(null);
    setStatus('idle');
  };

  return (
    <Fragment>
      <div className="d-flex" style={{ justifyContent: "space-around" }}>
        <Query
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          status={status}
        />
        <Query
          gamepad={true}
        />
      </div>
    </Fragment>
  );
}

export default Main;
