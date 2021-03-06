import {
  FETCH_INGREDIENT_LIST,
  INGREDIENT_CHANGE_FORM_VALUE,
  INGREDIENT_CREATE_NEW,
  INGREDIENT_VALIDATION,
  INGREDIENT_SNACKBAR,
  INGREDIENT_COPY,
  INGREDIENT_UPDATE,
} from './constants';
import { mapIngredient } from '../../models/Ingredient';
import { doIt, hosts } from '../../network';
import { Observable } from 'rxjs';
import { Map } from 'immutable';

export const fetchIngredientList = () => ({
  type: FETCH_INGREDIENT_LIST,
});

export const changeValue = (input, value) => ({
  type: INGREDIENT_CHANGE_FORM_VALUE,
  input,
  value,
});

export const saveIngredient = () => ({
  type: INGREDIENT_CREATE_NEW,
});

export const ingredientValidation = (ingredientErrors) => ({
  type: INGREDIENT_VALIDATION,
  ingredientErrors,
});

export const handleSnackbar = (value) => ({
  type: INGREDIENT_SNACKBAR,
  value,
});

export const saveIngredientListEpic = (action$, store$) =>
  action$.ofType(INGREDIENT_CREATE_NEW)
  .switchMap(() =>
    Observable.ajax(doIt(hosts.pk, 'ingredient/add', 'POST',
      JSON.stringify(store$.getState().ingredientContainer.ingredientForm)
      , true))
    .switchMap(() => [{
      type: `${FETCH_INGREDIENT_LIST}`,
      created: true,
    },
      {
        type: `NOTIF_ADD`,
        notification: {
          message: 'Ingredience vytvořena.',
        },
      }])
    .catch(error =>
      Observable.of({
        type: `NOTIF_ADD`,
        notification: {
          message: error.xhr.response,
          barStyle: { color: '#e57373' },
        },
      }))
  );

// wut wut
function arrayToMap(array) {
  let mapa = new Map();
  array.map((value) => {
    mapa = mapa.set(value.id, mapIngredient(value));
  });
  return mapa;
}

export const fetchIngredientListEpic = action$ =>
  action$.ofType(FETCH_INGREDIENT_LIST)
  .switchMap(() =>
    Observable.ajax(doIt(hosts.pk, 'ingredient/all-ingredients', 'GET', {}))
    .map(({ response }) => ({
      type: `${FETCH_INGREDIENT_LIST}_FULFILLED`,
      response: arrayToMap(response),
    }))
    .catch(error =>
      Observable.of({
        type: `NOTIF_ADD`,
        notification: {
          message: error.xhr.response,
          barStyle: { color: '#e57373' },
        },
      }))
  );

export const copyIngredient = ingredient => ({
  type: INGREDIENT_COPY,
  ingredient,
});

export const updateIngredient = () => ({
  type: INGREDIENT_UPDATE,
});

export const updateIngredientEpic = (action$, store) =>
  action$.ofType(INGREDIENT_UPDATE)
  .switchMap(() =>
    Observable.ajax(doIt(hosts.pk, 'ingredient/update', 'PUT',
      store.getState().ingredientContainer.get('ingredientForm'), true))
    .switchMap(() => ([
      {
        type: `${FETCH_INGREDIENT_LIST}`,
      },
      {
        type: `${INGREDIENT_UPDATE}_FULFILLED`,
      },
      {
        type: `NOTIF_ADD`,
        notification: {
          message: 'Ingredience byla upravena.',
        },
      },
    ]))
    .catch((error) =>
      Observable.of({
        type: `NOTIF_ADD`,
        notification: {
          message: error.xhr.response,
          barStyle: { color: '#e57373' },
        },
      }))
  );
