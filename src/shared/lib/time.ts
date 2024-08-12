function getAllElapsedMinutes(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();

  return Math.floor(diff / 1000 / 60);
}

function getElapsedSeconds(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();

  return Math.floor((diff / 1000) % 60);
}

export const elapsed = {
  allMinutes: getAllElapsedMinutes,
  seconds: getElapsedSeconds,
};

function formatXX(item: number) {
  return item < 10 ? '0' + item : item;
}

export function format(timestamp: Date | string) {
  const date = new Date(timestamp);
  const day = formatXX(date.getDate());
  const month = formatXX(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = formatXX(date.getHours());
  const minutes = formatXX(date.getMinutes());

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
