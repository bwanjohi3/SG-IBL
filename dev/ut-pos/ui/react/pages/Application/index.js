import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {getLink} from 'ut-front/react/routerHelper';
import {AddTab} from 'ut-front-react/containers/TabMenu';
import Header from 'ut-front-react/components/PageLayout/Header';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import {fetch, check, checkMulti, toggleColumn} from './actions';
import Text from 'ut-front-react/components/Text';
var spanFields = [];

// components
import AppDetails from '../../containers/Application/Details';
import Pagination from '../../components/Pagination';

// actions
import {addApplication, editApplication} from '../../containers/Application/Details/actions';

// styles
import mainStyle from 'ut-front-react/assets/index.css';

class Application extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.editApplication = this.editApplication.bind(this);
    }
    componentWillMount() {
        this.props.fetch();
    }
    handleCheckboxSelect(currentState, row, idx) {
        this.props.check(idx, row, currentState);
    }
    handleCheckboxSelectAll(currentState) {
        this.props.checkMulti(currentState);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.editChangeId !== nextProps.editChangeId) {
            this.props.fetch();
        }
    }
    editApplication() {
         let { rowsChecked, editApplication } = this.props;
        let rowChecked = rowsChecked.pop();
        editApplication(rowChecked.appId);
    }
    render() {
        let {rowsChecked, addApplication} = this.props;
        let rowsCheckedLen = rowsChecked.length;

        let buttons = [
            {text: 'Edit Application', onClick: this.editApplication, disabled: rowsCheckedLen !== 1, permissions: ['db/pos.application.edit', 'core.itemCode.fetch']},
            {text: 'Add Application', onClick: addApplication, permissions: ['db/pos.application.add', 'core.itemCode.fetch']}
        ];

        return (
            <div className={mainStyle.contentTableWrap}>
                <AddTab pathname={getLink('ut-pos:application')} title='POS Firmware List' />
                <Header text={<Text>POS Firmware List</Text>} buttons={buttons} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      spanFields={spanFields}
                      fields={this.props.gridFields.map((e) => Object.assign({}, e, {title: (<Text prefix='ut-pos-pos>application'>{e.title}</Text>)}))}
                      data={this.props.gridData}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      transformCellValue={this.handleTransformCellValue}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={this.props.rowsChecked} />
                </div>
                <div>
                    <AppDetails />
                </div>
                <div>
                    <Pagination />
                </div>
            </div>
        );
    }
};

Application.propTypes = {
    toggleColumn: PropTypes.func.isRequired,
    gridData: PropTypes.array.isRequired,
    rowsChecked: PropTypes.array.isRequired,
    gridFields: PropTypes.array.isRequired,
    editChangeId: PropTypes.number.isRequired,
    fetch: PropTypes.func,
    check: PropTypes.func,
    checkMulti: PropTypes.func,
    addApplication: PropTypes.func,
    editApplication: PropTypes.func
};

Application.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            gridFields: state.appTerminalGridColumnVisibility.toJS(),
            gridData: state.appTerminalGrid.get('data').toJS(),
            editChangeId: state.applicationDetails.get('changeId') +
                state.posTerminalGridPagination.get('changeId'),
            rowsChecked: state.appTerminalGrid.get('checkedRows').toList().toJS()
        };
    },
    {fetch, check, checkMulti, toggleColumn, addApplication, editApplication}
)(Application);
