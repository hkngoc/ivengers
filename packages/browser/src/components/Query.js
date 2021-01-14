import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  Button,
  Col
} from 'react-bootstrap';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import { withCookies } from 'react-cookie';

import Blocking from './Blocking';

import avatarGreen from '../assets/hulk.svg';
import avatarRed from '../assets/ironman.svg';
import GamePadSvg from './GamePadSvg';

import {
  HOSTS,
  TEAMS
} from './constant';

const Query = (props) => {
  const { onConnect, onDisconnect, status, gamepad, keyStatus, playerRed } = props;

  const [ player, setPlayer ] = useState(gamepad || playerRed);
  const [ disablePlayer, setDisablePlayer ] = useState(false);

  const { register, handleSubmit } = useForm();

  const onPlayerChange = (e) => {
    setPlayer(!player);
  }

  const onTeamChange = (e) => {
    const val = e.target.value;
    setDisablePlayer(val !== "no_select");
  }

  const onSubmit = (config) => {
    if (onDisconnect && status === "connected") {
      onDisconnect();
      return;
    }

    const { team } = config;

    const id = team === "no_select" ? (player ? "player2-xxx-xxx-xxx" : "player1-xxx-xxx-xxx") : team;
    config.playerId = id;

    if (onConnect) {
      onConnect(config);
    }
  }

  return (
    <Col
      className="query p-4 my-3 mx-5"
      xs={6}
      md={2}
    >
      <div className="py-3">
        {
          gamepad ? (
            <GamePadSvg {...keyStatus} className="avatar"/>
          ) : (
            <img
              className="d-flex mx-auto w-100 avatar"
              src={playerRed ? avatarRed : avatarGreen}
              alt="avatar"
            />
          )
        }
      </div>
      <div className="py-3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Blocking blocking={status === "connected"}>
            <Form.Control
              as="select"
              name="host"
              ref={register}
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
    </Col>
  );
}

export default withCookies(Query);
