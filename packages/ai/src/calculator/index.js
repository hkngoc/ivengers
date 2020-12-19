const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
};

const ai = async (data, more) => {
  console.log(JSON.stringify(data));
  await wait(230);
  return 1;
};

export default ai;
