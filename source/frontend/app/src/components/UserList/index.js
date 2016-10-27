import React, { PropTypes, Component } from 'react';

import styles from './index.module.scss';
import cssModules from 'react-css-modules';
import Table from 'react-toolbox/lib/table';


const TableModel = {
  name: { type: String, title: 'Jméno a příjmení' },
  login: { type: String, title: 'Uživatelské jméno' },
  role: { type: String, title: 'Role' },
  phone: { type: String, title: 'Telefon' },
};

class UserList extends Component { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <div className={styles.userList}>
        <h1>Seznam uživatelů</h1>
        <Table
          model={TableModel}
          selectable={false}
          source={this.props.users}
        />
      </div>);
  }
}


UserList.propTypes = {
  users: PropTypes.object.isRequired,
};

export default cssModules(UserList, styles);