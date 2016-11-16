import React, { PropTypes, Component } from 'react';
import styles from './index.module.scss';
import cssModules from 'react-css-modules';
import Table from 'react-toolbox/lib/table';

const TableModel = {
  name: { type: String, title: 'Název Kategorie' },
};

class CategoryList extends Component { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <div className={styles.categotyList}>
        <h1>Seznam kategorii pizz</h1>
        <Table
          model={TableModel}
          selectable={false}
          source={this.props.category}
        />
      </div>);
  }
}


CategoryList.propTypes = {
  category: PropTypes.object.isRequired,
};

export default cssModules(CategoryList, styles);
