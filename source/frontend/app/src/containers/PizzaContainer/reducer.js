import {
  FETCH_PIZZA_LIST,
  PIZZA_CHANGE_FORM_VALUE,
  PIZZA_VALIDATION,
  PIZZA_COPY,
  PIZZA_PAG_PROPERTIES,
  PIZZA_DIALOG,
} from './constants';
import { Record, Map, List, fromJS } from 'immutable';
import { mapPizzaForm, mapPizza } from '../../models/Pizza';

export const initialPizzaForm = new Map({
  title: '',
  categoryId: '',
  ingredientsId: new List(),
  price: 0,
  active: true,
});

const initialPizzaErrors = {
  titleErr: '',
  categoryErr: '',
  ingredientsErr: '',
  priceErr: '',
};


const initialDialog = {
  showDialog: false,
  pizza: initialPizzaForm,
};

const InitialState = new Record(
  {
    loading: false,
    pizzas: new Map(),
    pizzaForm: initialPizzaForm,
    pizzaErrors: initialPizzaErrors,
    copied: false,
    dialog: initialDialog,
    pagination: fromJS({
      totalPages: 0,
      totalElements: 0,
      size: 5,
      number: 0,
      sortDir: 'ASC',
      sortBy: 'id',
      filterBy: '',
    }),
  }
);

const pizzaReducer =
  (state = new InitialState(), action) => {
    switch (action.type) {
      case `${FETCH_PIZZA_LIST}`: {
        return state.withMutations(s => s
        .set('loading', true)
        .set('pizzaErrors', initialPizzaErrors)
        .set('dialog', initialDialog)
        .set('copied', false)
        .set('pizzaForm', initialPizzaForm)
        );
      }
      case `${FETCH_PIZZA_LIST}_FULFILLED`: {
        const { content, totalPages, totalElements, size, number } = action.response;
        const { direction, property } = action.response.sort ? action.response.sort[0] : null;
        let pizzas = new Map();
        content.map(pizza => pizzas = pizzas.set(pizza.id, mapPizza(pizza)));
        return state.withMutations(s => s
        .setIn(['pagination', 'totalPages'], totalPages)
        .setIn(['pagination', 'totalElements'], totalElements)
        .setIn(['pagination', 'size'], size)
        .setIn(['pagination', 'number'], number)
        .setIn(['pagination', 'sortDir'], direction)
        .setIn(['pagination', 'sortBy'], property)
        .set('pizzas', pizzas)
        .set('loading', false));
      }
      case `${FETCH_PIZZA_LIST}_FAILED`: {
        return state.withMutations(s => s
        .set('pizzas', new Map())
        .set('loading', false)
        );
      }
      case `${PIZZA_PAG_PROPERTIES}`: {
        let sortDir = state.getIn(['pagination', 'sortDir']);
        if (action.paginationType === 'sortBy') {
          sortDir = sortDir === 'ASC' ? 'DESC' : 'ASC';
        }
        return state.withMutations(s => s
          .setIn(['pagination', action.paginationType], action.value)
          .setIn(['pagination', 'sortDir'], sortDir)
        );
      }
      case `${PIZZA_CHANGE_FORM_VALUE}`: {
        return state.withMutations(s => s
        .setIn(['pizzaForm', action.input], action.value)
        .set('copied', false));
      }
      case PIZZA_VALIDATION: {
        return state.withMutations(s => s
        .set('pizzaErrors', action.pizzaErrors));
      }
      case PIZZA_COPY: {
        return state.withMutations(s => s
        .set('pizzaForm', mapPizzaForm(action.pizza))
        .set('copied', true));
      }
      case PIZZA_DIALOG: {
        return state.set('dialog', action.dialog);
      }
      default:
        return state;
    }
  };

export default pizzaReducer;
