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

const HOSTS = process.env.REACT_APP_HOSTS.split(",");

const TEAMS = process.env.REACT_APP_TEAMS.split(";")
  .map(t => {
    const val = t.split(",");
    return {
      label: val[0],
      value: val[1]
    }
  });

export {
  KEYS,
  KEYS_MAP_COMMAND,
  KEYS_MAP_GAMEPAD,
  HOSTS,
  TEAMS
}
