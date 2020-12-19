const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
};

const ai = async (data, more) => {
  console.log(data, more);
  await wait(230);
  return 1;
};

export default ai;
