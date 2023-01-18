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
import BinListDetails from '../../containers/BinList/Details';
import Pagination from '../../components/Pagination';

// actions
import {addBinList, editBinList} from '../../containers/BinList/Details/actions';

// styles
import mainStyle from 'ut-front-react/assets/index.css';

class BinList extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.editBinList = this.editBinList.bind(this);
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
    editBinList() {
         let { rowsChecked, editBinList } = this.props;
        let rowChecked = rowsChecked.pop();
        editBinList(rowChecked.binListId);
    }
    render() {
        let {rowsChecked, addBinList} = this.props;
        let rowsCheckedLen = rowsChecked.length;

        let buttons = [
            {text: 'Edit Bin List', onClick: this.editBinList, disabled: rowsCheckedLen !== 1, permissions: ['db/pos.binList.edit', 'core.itemCode.fetch']},
            {text: 'Add Bin List', onClick: addBinList, permissions: ['db/pos.binList.add', 'core.itemCode.fetch']}
        ];

        return (
            <div className={mainStyle.contentTableWrap}>
                <AddTab pathname={getLink('ut-pos:binList')} title='POS Bin List' />
                <Header text={<Text>POS Allowed Bin & Transaction List</Text>} buttons={buttons} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      spanFields={spanFields}
                      fields={this.props.gridFields.map((e) => Object.assign({}, e, {title: (<Text prefix='ut-pos-pos>binlist'>{e.title}</Text>)}))}
                      data={this.props.gridData}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      transformCellValue={this.handleTransformCellValue}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={this.props.rowsChecked} />
                </div>
                <div>
                    <BinListDetails />
                </div>
                <div>
                    <Pagination />
                </div>
            </div>
        );
    }
};

BinList.propTypes = {
    toggleColumn: PropTypes.func.isRequired,
    gridData: PropTypes.array.isRequired,
    rowsChecked: PropTypes.array.isRequired,
    gridFields: PropTypes.array.isRequired,
    editChangeId: PropTypes.number.isRequired,
    fetch: PropTypes.func,
    check: PropTypes.func,
    checkMulti: PropTypes.func,
    addBinList: PropTypes.func,
    editBinList: PropTypes.func
};

BinList.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            gridFields: state.binListTerminalGridColumnVisibility.toJS(),
            gridData: state.binListTerminalGrid.get('data').toJS(),
            editChangeId: state.binListDetails.get('changeId') +
                state.posTerminalGridPagination.get('changeId'),
            rowsChecked: state.binListTerminalGrid.get('checkedRows').toList().toJS()
        };
    },
    {fetch, check, checkMulti, toggleColumn, addBinList, editBinList}
)(BinList);
