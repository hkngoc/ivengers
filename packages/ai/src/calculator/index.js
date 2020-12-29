import Logger from 'js-logger';
import {
  First as AI
} from './variant';

//===============================================================
const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
};

const wrapper = async (...params) => {
  // console.log(JSON.stringify(params));
  // console.log(params);

  Logger.useDefaults();
  Logger.time('logic');
  const result = await new Promise((resolve) => {
    const r = new AI(...params).tick();

    resolve(r);
  });
  Logger.timeEnd('logic');

  // just mock for currenly implement
  // await wait(170);

  return result;
};

export default wrapper;
