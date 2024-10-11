var startTime = Date.now();

const LoadSpeedChecker = {
  getElapsedTime: () => {
    return Date.now() - startTime;
  }
};
