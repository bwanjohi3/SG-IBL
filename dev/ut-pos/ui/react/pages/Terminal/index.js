import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {getLink} from 'ut-front/react/routerHelper';
import {AddTab} from 'ut-front-react/containers/TabMenu';
import Header from 'ut-front-react/components/PageLayout/Header';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import {fetch, check, checkMulti, toggleColumn} from './actions';
import Text from 'ut-front-react/components/Text';
var spanFields = [
    {title: <Text prefix='ut-pos-pos>terminals'>POS DETAILS</Text>, children: ['terminalId', 'terminalName']}
];

// components
import PosDetails from '../../containers/POS/Details';
import Pagination from '../../components/Pagination';

// actions
import {addPos, editPos} from '../../containers/POS/Details/actions';

// styles
import mainStyle from 'ut-front-react/assets/index.css';

class Terminal extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.editPos = this.editPos.bind(this);
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
    editPos() {
         let { rowsChecked, editPos } = this.props;
        let rowChecked = rowsChecked.pop();
        editPos(rowChecked.terminalId);
    }
    render() {
        let {rowsChecked, addPos} = this.props;
        let rowsCheckedLen = rowsChecked.length;

        let buttons = [
            {text: 'Edit POS', onClick: this.editPos, disabled: rowsCheckedLen !== 1, permissions: ['db/pos.terminal.edit', 'core.itemCode.fetch', 'core.currency.fetch', 'db/pos.terminal.fetch', 'db/pos.organization.list']},
            {text: 'Add POS', onClick: addPos, permissions: ['db/pos.terminal.add', 'core.itemCode.fetch', 'core.currency.fetch', 'db/pos.terminal.fetch', 'db/pos.organization.list']}
        ];

        return (
            <div className={mainStyle.contentTableWrap}>
                <AddTab pathname={getLink('ut-pos:terminal')} title='POS Device List' />
                <Header text={<Text>POS Device List</Text>} buttons={buttons} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      spanFields={spanFields}
                      fields={this.props.gridFields.map((e) => Object.assign({}, e, {title: (<Text prefix='ut-pos-pos>terminals'>{e.title}</Text>)}))}
                      data={this.props.gridData}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      transformCellValue={this.handleTransformCellValue}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={this.props.rowsChecked} />
                </div>
                <div>
                    <PosDetails />
                </div>
                <div>
                    <Pagination />
                </div>
            </div>
        );
    }
};

Terminal.propTypes = {
    toggleColumn: PropTypes.func.isRequired,
    gridData: PropTypes.array.isRequired,
    rowsChecked: PropTypes.array.isRequired,
    gridFields: PropTypes.array.isRequired,
    editChangeId: PropTypes.number.isRequired,
    fetch: PropTypes.func,
    check: PropTypes.func,
    checkMulti: PropTypes.func,
    addPos: PropTypes.func,
    editPos: PropTypes.func
};

Terminal.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            gridFields: state.posTerminalGridColumnVisibility.toJS(),
            gridData: state.posTerminalGrid.get('data').toJS(),
            editChangeId: state.posDetails.get('changeId') +
                state.posTerminalGridPagination.get('changeId'),
            rowsChecked: state.posTerminalGrid.get('checkedRows').toList().toJS()
        };
    },
    {fetch, check, checkMulti, toggleColumn, addPos, editPos}
)(Terminal);
