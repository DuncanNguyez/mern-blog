const handleAsyncFn = async <O>(fn: () => O): Promise<O | false> => {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    console.debug(error);
    return false;
  }
};

export default handleAsyncFn;
