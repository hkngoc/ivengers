import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  Button
} from 'react-bootstrap';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';

import Blocking from './Blocking';

import avatar from './assets/rocket_raccoon.svg';
import gamepadIcon from './assets/gamepad-icon1.png';

const HOSTS = process.env.REACT_APP_HOSTS.split(",");
const DEFAULT_HOST = HOSTS[0];

const TEAMS = process.env.REACT_APP_TEAMS.split(";")
  .map(t => {
    const val = t.split(",");
    return {
      label: val[0],
      value: val[1]
    }
  });

const Query = (props) => {
  const { onConnect, onDisconnect, status, gamepad } = props;

  const [ player, setPlayer ] = useState(gamepad);
  const [ disablePlayer, setDisablePlayer ] = useState(false);

  const { register, handleSubmit } = useForm();

  const onPlayerChange = (e) => {
    setPlayer(!player);
  };

  const onTeamChange = (e) => {
    const val = e.target.value;
    setDisablePlayer(val !== "no_select");
  };

  const onSubmit = (config) => {
    if (onDisconnect && status === "connected") {
      onDisconnect();
      return;
    }

    const { team, player } = config;
    const id = team == "no_select" ? (player ? "player2-xxx-xxx-xxx" : "player1-xxx-xxx-xxx") : team;
    config.playerId = id;

    if (onConnect) {
      onConnect(config);
    }
  };

  return (
    <div id="main" className="p-5 mt-3 col-md-4">
      <div className="py-3">
        <img
          className="d-flex mx-auto w-100 avatar"
          src={gamepad ? gamepadIcon : avatar}
          alt="avatar"/>
      </div>
      <div className="py-3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Blocking blocking={status === "connected"}>
            <Form.Control
              as="select"
              name="host"
              ref={register}
              defaultValue={DEFAULT_HOST}
              disabled={status === "connected"}
            >
              {
                HOSTS.map(host => (
                  <option key={host} value={host}>{ host.split("//")[1] }</option>
                ))
              }
            </Form.Control>
          </Blocking>
          <Blocking blocking={status === "connected"}>
            <Form.Control
              name="gameId"
              ref={register}
              autoComplete="off"
              spellCheck={false}
              placeholder="game id"
              disabled={status === "connected"}
            />
          </Blocking>
          <Blocking blocking={status === "connected"}>
            <Form.Control
              as="select"
              name="team"
              ref={register}
              defaultValue={"no_select"}
              onChange={onTeamChange}
              disabled={status === "connected"}
            >
              <option key="no_select" value="no_select">{ "select team..." }</option>
              {
                TEAMS.map(team => (
                  <option key={team.value} value={team.value}>{ team.label }</option>
                ))
              }
            </Form.Control>
          </Blocking>
          <Blocking blocking={status === "connected"}>
            <BootstrapSwitchButton
              name="player"
              ref={register}
              disabled={disablePlayer || status === "connected"}
              onlabel="player2"
              onstyle="danger"
              offlabel="player1"
              offstyle="success"
              onChange={onPlayerChange}
              checked={player}
            />
          </Blocking>
          <Button
            id="connect"
            type="submit"
            variant="secondary"
          >
            { status === "connected" ? "disconnect" : "connect"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Query;
