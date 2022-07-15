function getAllElapsedMinutes(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();

  return Math.floor(diff / 1000 / 60);
};

function getElapsedSeconds(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();

  return Math.floor(diff / 1000 % 60);
};

export const elapsed = {
  allMinutes: getAllElapsedMinutes,
  seconds: getElapsedSeconds,
};
