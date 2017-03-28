/**
 * Created by Farmas on 21.10.2016.
 */
export const hosts = {
  // dev
  // pk: `http://${window.location.hostname}:6080`,
  // prod
  pk: `https://pizzak.herokuapp.com`

};

export const getToken = () => {
  try {
    const tokenStr = (window.localStorage.getItem('token'));
    const token = JSON.parse(tokenStr);
    return token;
  } catch (ex) {
    return null;
  }
};

export const isLoggedIn = () => {
  const token = getToken();
  return token && token.access_token;
};

export const removeToken = () => {
  window.localStorage.removeItem('token');
};

export const setToken = (token) => {
  window.localStorage.setItem('token', JSON.stringify(token));
};

const defaultHeader = (json, body) => ({
  async: true,
  crossDomain: true,
  headers: {
    'cache-control': 'no-cache',
    'Content-Type': `${json
      ? 'application/json'
      : 'application/x-www-form-urlencoded; charset=UTF-8'}`,
    authorization: isLoggedIn()
      ? `Bearer ${getToken().access_token}`
      : 'Basic YWNtZTphY21lc2VjcmV0',
  },
  processData: false,
  contentType: false,
  mimeType: 'multipart/form-data',
});

export const doIt = (host, path, methodString, body = {}, json = false) => {
  const received = {
    url: `${host}/${path}`,
    method: methodString,
    body,
  };
  const header = defaultHeader(json, body);
  return Object.assign(
    received,
    header,
  );
};
