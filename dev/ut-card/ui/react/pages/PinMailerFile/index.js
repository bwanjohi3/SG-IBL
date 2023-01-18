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
import PinMailerFileDetails from '../../containers/PinMailerFile/Details';
import Pagination from '../../components/Pagination';

// actions
import {addApplication, editApplication} from '../../containers/PinMailerFile/Details/actions';

// styles
import mainStyle from 'ut-front-react/assets/index.css';

class PinMailerFile extends Component {
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
            {text: 'Import Pin Mailer File.', onClick: addApplication, permissions: ['db/card.pinMailerFile.add', 'core.itemCode.fetch']}
        ];

        let defaultPagination =  {
                    pageSize: 25,
                    pageNumber: 1,
                    recordsTotal: 0
                };

        return (
            <div className={mainStyle.contentTableWrap}>
                <AddTab pathname={getLink('ut-card:pinMailerFile')} title='Pin Mailer File' />
                <Header text={<Text>Pin Mailer File</Text>} buttons={buttons} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      spanFields={spanFields}
                      fields={this.props.gridFields.map((e) => Object.assign({}, e, {title: (<Text prefix='ut-pos-pos>pinMailerFile'>{e.title}</Text>)}))}
                      data={this.props.gridData}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      transformCellValue={this.handleTransformCellValue}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={this.props.rowsChecked} />
                </div>
                <div>
                    <PinMailerFileDetails />
                </div>
                <div>
                    <Pagination pagination={this.props.pagination}/>
                </div>
            </div>
        );
    }
};

PinMailerFile.propTypes = {
    toggleColumn: PropTypes.func.isRequired,
    gridData: PropTypes.array.isRequired,
    rowsChecked: PropTypes.array.isRequired,
    gridFields: PropTypes.array.isRequired,
    editChangeId: PropTypes.number.isRequired,
    fetch: PropTypes.func,
    check: PropTypes.func,
    checkMulti: PropTypes.func,
    addPinMailerFile: PropTypes.func,
    editApplication: PropTypes.func,
    pagination: PropTypes.object.isRequired, 
};

PinMailerFile.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            pagination: state.pinMailerFileGrid.get('pagination'),
            gridFields: state.pinMailerFileGridColumnVisibility.toJS(),
            gridData: state.pinMailerFileGrid.get('data').toJS(),
            editChangeId: state.pinMailerFileDetails.get('changeId') +
                state.posTerminalGridPagination.get('changeId'),
            rowsChecked: state.pinMailerFileGrid.get('checkedRows').toList().toJS()
        };
    },
    {fetch, check, checkMulti, toggleColumn, addApplication, editApplication}
)(PinMailerFile);
