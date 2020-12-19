const wait = (amount) => {
  return new Promise(resolve => {
    return setTimeout(resolve, amount);
  });
};

const ai = async (params) => {
  console.log(params);
  await wait(230);
};

export default ai;
