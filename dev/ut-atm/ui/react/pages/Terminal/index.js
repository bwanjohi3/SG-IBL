import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {getLink} from 'ut-front/react/routerHelper';
import {AddTab} from 'ut-front-react/containers/TabMenu';
import Header from 'ut-front-react/components/PageLayout/Header';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import {fetch, check, checkMulti, toggleColumn} from './actions';
import Text from 'ut-front-react/components/Text';
var spanFields = [
    {title: <Text prefix='ut-atm-atm>terminals'>ATM DETAILS</Text>, children: ['atmId', 'luno', 'tmk', 'tmkkvv', 'name',  'cassette1Currency', 'cassette1Denomination', 'cassette2Currency', 'cassette2Denomination', 'cassette3Currency', 'cassette3Denomination', 'cassette4Currency', 'cassette4Denomination', 'terminalId', 'terminalName', 'institutionCode', 'identificationCode', 'customization', 'merchantId', 'merchantType', 'address', 'country', 'state', 'city', 'organizationName']},
    {title: <Text prefix='ut-atm-atm>terminals'>Sensors</Text>, children: ['sensor.door', 'sensor.supervisorMode', 'sensor.vibration', 'sensor.silentSignal', 'sensor.electronicsEnclosure', 'sensor.depositBin', 'sensor.cardBin', 'sensor.rejectBin', 'sensor.cassette1', 'sensor.cassette2', 'sensor.cassette3', 'sensor.cassette4', 'sensor.coinDispenser', 'sensor.coinHopper1', 'sensor.coinHopper2', 'sensor.coinHopper3', 'sensor.coinHopper4', 'sensor.cpmPockets']},
    {title: <Text prefix='ut-atm-atm>terminals'>Fitness</Text>, children: ['fitness.clock', 'fitness.comms', 'fitness.disk', 'fitness.cardReader', 'fitness.cashHandler', 'fitness.depository', 'fitness.receiptPrinter', 'fitness.nightDepository', 'fitness.encryptor', 'fitness.camera', 'fitness.doorAccess', 'fitness.flexDisk', 'fitness.cassette1', 'fitness.cassette2', 'fitness.cassette3', 'fitness.cassette4', 'fitness.statementPrinter', 'fitness.signageDisplay', 'fitness.systemDisplay', 'fitness.mediaEntry', 'fitness.envelopeDispenser', 'fitness.documentProcessing', 'fitness.coinDispenser', 'fitness.voiceGuidance', 'fitness.noteAcceptor', 'fitness.chequeProcessor']},
    {title: <Text prefix='ut-atm-atm>terminals'>Supplies</Text>, children: ['supply.cardReader', 'supply.depository', 'supply.receiptPrinter', 'supply.journalPrinter', 'supply.rejectBin', 'supply.cassette1', 'supply.cassette2', 'supply.cassette3', 'supply.cassette4']},
    {title: <Text prefix='ut-atm-atm>terminals'>Counters</Text>, children: ['counter.notes1', 'counter.notes2', 'counter.notes3', 'counter.notes4', 'counter.rejected1', 'counter.rejected2', 'counter.rejected3', 'counter.rejected4', 'counter.dispensed1', 'counter.dispensed2', 'counter.dispensed3', 'counter.dispensed4', 'counter.last1', 'counter.last2', 'counter.last3', 'counter.last4', 'counter.captured', 'counter.transactionCount', 'counter.transactionSerialNumber']}
];

// components
import AtmDetails from '../../containers/ATM/Details';
import Pagination from '../../components/Pagination';

// actions
import {addAtm, editAtm} from '../../containers/ATM/Details/actions';

// styles
import mainStyle from 'ut-front-react/assets/index.css';

class Terminal extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.editAtm = this.editAtm.bind(this);
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
    editAtm() {
        let { rowsChecked, editAtm } = this.props;
        let rowChecked = rowsChecked.pop();
        editAtm(rowChecked.atmId);
    }
    render() {
        let {rowsChecked, addAtm} = this.props;
        let rowsCheckedLen = rowsChecked.length;

        let buttons = [
            {text: 'Edit ATM', onClick: this.editAtm, disabled: rowsCheckedLen !== 1, permissions: ['db/atm.terminal.edit', 'core.itemCode.fetch', 'core.currency.fetch', 'db/atm.terminal.fetch', 'db/atm.organization.list']},
            {text: 'Add ATM', onClick: addAtm, permissions: ['db/atm.terminal.add', 'core.itemCode.fetch', 'core.currency.fetch', 'db/atm.terminal.fetch', 'db/atm.organization.list']}
        ];

        return (
            <div className={mainStyle.contentTableWrap}>
                <AddTab pathname={getLink('ut-ctp:atm:terminal')} title='ATM Device List' />
                <Header text={<Text>ATM Device List</Text>} buttons={buttons} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      spanFields={spanFields}
                      fields={this.props.gridFields.map((e) => Object.assign({}, e, {title: (<Text prefix='ut-atm-atm>terminals'>{e.title}</Text>)}))}
                      data={this.props.gridData}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      transformCellValue={this.handleTransformCellValue}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={this.props.rowsChecked} />
                </div>
                <div>
                    <AtmDetails />
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
    addAtm: PropTypes.func,
    editAtm: PropTypes.func
};

Terminal.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            gridFields: state.atmTerminalGridColumnVisibility.toJS(),
            gridData: state.atmTerminalGrid.get('data').toJS(),
            editChangeId: state.atmDetails.get('changeId') +
                state.atmTerminalGridPagination.get('changeId'),
            rowsChecked: state.atmTerminalGrid.get('checkedRows').toList().toJS()
        };
    },
    {fetch, check, checkMulti, toggleColumn, addAtm, editAtm}
)(Terminal);
