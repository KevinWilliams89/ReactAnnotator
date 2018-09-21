let online = navigator.onLine;

const connectivityChange = event => {
  online = event.type === 'online';
  console.log('Connection is now: ', online);
};

const onOnline = () => {
  online = true;
  console.log('Connection is now: ', online);
};

const onOffline = () => {
  online = false;
  console.log('Connection is now: ', online);
};

const isOnline = () => online;

document.addEventListener('online', onOnline, false);
document.addEventListener('offline', onOffline, false);

window.addEventListener('online', connectivityChange);
window.addEventListener('offline', connectivityChange);

export default isOnline;
