import { Observable } from 'rxjs';
import { browserHistory } from 'react-router';
import { hosts, doIt, setToken, removeToken, getToken } from '../../network';
import {
  LOGIN_DIALOG,
  LOGIN_FORM_CHANGE,
  LOGIN_FORM_ERRORS,
  LOGIN,
  FETCH_MYSELF,
  LOGOUT,
  LOGOUT_ALL,
  USERPWD_CHANGE_FORM_VALUE,
  USERPWD_CONFIRM_CHANGE,
  PASSWORD_CHANGE_DIALOG,
} from './constants';
import { FETCH_MENU } from '../MenuContainer/constants';

export const toggleDialog = () => ({
  type: LOGIN_DIALOG,
});

export const togglePasswordDialog = () => ({
  type: PASSWORD_CHANGE_DIALOG,
});

export const loginChange = (name, value) => ({
  type: LOGIN_FORM_CHANGE,
  name,
  value,
});

export const setLoginErrors = (loginErrors) => ({
  type: LOGIN_FORM_ERRORS,
  loginErrors,
});

export const login = (username, password) => ({
  type: LOGIN,
  body: {
    grant_type: 'password',
    username,
    password,
  },
});

export const fetchMyself = () => ({
  type: FETCH_MYSELF,
});

export const loginEpic = action$ =>
  action$.ofType(LOGIN)
  .mergeMap(action => Observable.merge(
    Observable.ajax(doIt(hosts.pk, 'oauth/token', 'POST', action.body))
    .do((payload) => {
      setToken(payload.response);
      browserHistory.push('/');
    })
    .switchMap(payload => [
      {
        type: `${LOGIN}_FULFILLED`,
        login: action.body.username,
        payload: payload.response,
      },
      {
        type: `NOTIF_ADD`,
        notification: {
          message: 'Uživatel úspěšně přihlášen.',
        },
      },
    ])
    .catch(error => {
      let message = '';
      if (error.xhr.response) {
        if (error.xhr.response.error_description.includes('Could not authenticate')) {
          message = 'Přihlášení se nezdařilo.';
        } else {
          message = error.xhr.response.error_description;
        }
      } else {
        message = 'Nepodařilo se navázat spojení.';
      }
      return Observable.of({
        type: `${LOGIN}_REJECTED`,
        payload: message,
      });
    })
  .startWith({
    type: `${LOGIN}_PENDING`,
  })));

export const loggedInEpic = action$ =>
  action$.ofType(`${LOGIN}_FULFILLED`)
  .switchMap(() => [
    {
      type: FETCH_MYSELF,
    },
  ]);

export const fetchMyselfEpic = action$ =>
  action$.ofType(FETCH_MYSELF)
  .mergeMap(() => Observable.ajax(doIt(hosts.pk, `user/myself`, 'GET', {}))
    .switchMap(payload => [
      {
        type: `${FETCH_MYSELF}_FULFILLED`,
        user: payload.response,
      },
      {
        type: FETCH_MENU,
      },
    ])
    .catch(error => Observable.of({
      type: 'NOTIF_ADD',
      notification: {
        message: error.xhr.response,
        barStyle: { color: '#e57373' },
      },
    }))
  );

export const logout = () => ({
  type: LOGOUT,
});

export const logoutEpic = action$ =>
  action$.ofType(LOGOUT)
  .mergeMap(() =>
    Observable.ajax(doIt(hosts.pk, `user/logout?token=${getToken().access_token}`, 'POST', {}))
    .switchMap(() => [
      {
        type: `${LOGOUT}_FULFILLED`,
      },
      {
        type: 'NOTIF_ADD',
        notification: {
          message: 'Uživatel byl úspěšně odhlášen.',
        },
      },
    ])
    .do(() => {
      removeToken();
      browserHistory.push('/');
    })
    .catch(error => {
      removeToken();
      browserHistory.push('/');
      return Observable.of({
        type: 'NOTIF_ADD',
        notification: {
          message: error.xhr.response,
          barStyle: { color: '#e57373' },
        },
      });
    })
  );

export const logoutWindowsEpic = action$ =>
  action$.ofType(LOGOUT_ALL)
  .do(() => {
    browserHistory.push('/');
  });

export const changeValue = (input, value) => ({
  type: USERPWD_CHANGE_FORM_VALUE,
  input,
  value,
});

export const confirmChange = (username, old, newPass) => ({
  type: USERPWD_CONFIRM_CHANGE,
  login: username,
  old,
  newPass,
});

export const userpwdConfirmChange = action$ =>
  action$.ofType(USERPWD_CONFIRM_CHANGE)
  .switchMap((action) =>
    Observable.ajax(doIt(hosts.pk, 'user/changePassword', 'POST',
      {
        login: action.login,
        userOldPassword: action.old,
        userNewPassword: action.newPass,
      }
      , true))
    .switchMap(() => [
      {
        type: `${USERPWD_CONFIRM_CHANGE}_FULFILLED`,
      },
      {
        type: `NOTIF_ADD`,
        notification: {
          message: 'Heslo změněno.',
        },
      },
    ])
    .catch(error =>
      Observable.of({
        type: `NOTIF_ADD`,
        notification: {
          message: error.xhr.response && error.xhr.response.message,
          barStyle: { color: '#e57373' },
        },
      }))
  );
