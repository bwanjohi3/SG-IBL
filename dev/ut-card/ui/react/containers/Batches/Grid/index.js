import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {List, Map} from 'immutable';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import {open as handleDetailsOpen} from '../Details/actions';
import { fetch, fetchBusinessUnits, check, checkSingle, multiCheck, toggleColumn, setVisibleColumns, areAllCardsGeneratedUpdate } from './actions';
import {resetState, setDownloadLink} from '../BatchDownloadInfo/actions';

import Text from 'ut-front-react/components/Text';
import { order } from './Order/actions';
import {set as handleToolboxSet} from '../GridToolbox/actions.js';
import style from './style.css';

export class BatchesGrid extends Component {
    constructor(props) {
        super(props);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCheckBoxSelect = this.handleCheckBoxSelect.bind(this);
        this.handleHeaderCheckboxSelect = this.handleHeaderCheckboxSelect.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }
    componentWillMount() {
        this.props.setVisibleColumns();
        this.props.fetchBusinessUnits();
        this.props.fetch(this.props.filterValues, this.props.orderBy, this.props.paging);
    }
    componentWillReceiveProps(nextProps) { // fetch grid if there is some changes in filters
        if ((this.props.changeId !== nextProps.changeId) || nextProps.gridProps.get('refetchData') === true) {
            this.props.fetch(nextProps.filterValues, nextProps.orderBy, nextProps.paging);
        } else if (this.props.gridProps.get('changeId') !== nextProps.gridProps.get('changeId')) {
            let filtersOpened;
            let checkedBatchItems = nextProps.gridProps.get('checkedBatchItems');
            if (checkedBatchItems.size > 0) {
                filtersOpened = false;
                if (checkedBatchItems.size === 1) {
                    let batchId = checkedBatchItems.first().get('areAllCardsGenerated')
                        ? checkedBatchItems.first().get('id')
                        : undefined;
                    this.props.setDownloadLink(batchId);
                }
            } else {
                filtersOpened = true;
            }
            this.props.handleToolboxSet(filtersOpened);
        } else if (nextProps.areAllCardsGeneratedUpdateInfo.get('do') && nextProps.areAllCardsGeneratedUpdateInfo.get('checkedIdx')) {
            this.props.areAllCardsGeneratedUpdate({
                checkedIdx: nextProps.areAllCardsGeneratedUpdateInfo.get('checkedIdx'),
                value: nextProps.areAllCardsGeneratedUpdateInfo.get('value')
            });
            this.props.resetState();
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.gridProps.get('changeId') !== nextProps.gridProps.get('changeId')) {
            return true;
        }
        return false;
    }
    handleCellClick(record, field, value) {
        if (field.name === 'batchName' && this.context.checkPermission('card.batch.get')) {
            this.props.handleDetailsOpen(record.id);
        } else {
            this.props.checkSingle(record);
        }
    }

    handleOrder(result) {
        this.props.order(result.field, result.new);
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            switch (field.name) {
                case 'batchName':
                    return (<a> {value} </a>);
                case 'batchDateCreated':
                case 'batchDateSent':
                    return (<DateFormatter format='DD/MM/YYYY'>{value}</DateFormatter>);
                default:
                    break;
            }
        }
        return value;
    }
    handleCheckBoxSelect(currentState, row, idx) {
        this.props.check(idx, row, currentState);
    }
    handleHeaderCheckboxSelect(currentState) {
        this.props.multiCheck(currentState);
    }
    render() {
        let {config} = this.props;
        return (
            <div className={style.tableWrap} >
                <SimpleGrid
                  multiSelect
                  globalMenu
                  fields={this.props.gridFields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                  data={this.props.gridProps.get('data').toJS()}
                  emptyRowsMsg={<Text>No result</Text>}
                  toggleColumnVisibility={this.props.toggleColumn}
                  transformCellValue={this.handleTransformCellValue}
                  handleCheckboxSelect={this.handleCheckBoxSelect}
                  handleHeaderCheckboxSelect={this.handleHeaderCheckboxSelect}
                  handleOrder={this.handleOrder}
                  handleCellClick={this.handleCellClick}
                  rowsChecked={this.props.gridProps.get('checkedBatchItems').toList().toJS()}
                  orderBy={config.getIn(['grid', 'orderByFields']) && config.getIn(['grid', 'orderByFields']).toJS()}
                />
            </div>
        );
    }
};

BatchesGrid.propTypes = {
    config: PropTypes.object,
    fetch: PropTypes.func.isRequired,
    fetchBusinessUnits: PropTypes.func,
    gridFields: PropTypes.array.isRequired,
    areAllCardsGeneratedUpdate: PropTypes.func,
    resetState: PropTypes.func,
    setDownloadLink: PropTypes.func,
    areAllCardsGeneratedUpdateInfo: PropTypes.object,
    changeId: PropTypes.number.isRequired,
    filterValues: PropTypes.object.isRequired,
    orderBy: PropTypes.array.isRequired,
    gridProps: PropTypes.object.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    handleDetailsOpen: PropTypes.func,
    paging: PropTypes.object,
    check: PropTypes.func,
    checkSingle: PropTypes.func,
    handleToolboxSet: PropTypes.func,
    multiCheck: PropTypes.func,
    order: PropTypes.func.isRequired
};

BatchesGrid.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            config: state.cardConfig.get('batches'),
            gridProps: state.batchesGrid,
            gridFields: state.batchesGridColumnVisibility.get('fields').toJS(),
            areAllCardsGeneratedUpdateInfo: state.batchDownloadInfo.get('areAllCardsGeneratedUpdateInfo'),
            filterValues: {
                statusId: state.batchesFilterByStatus.get('value') || null,
                productId: state.batchesFilterByProduct.get('value') || null,
                targetBranchId: state.batchesFilterByTargetUnit.get('value') || null,
                issuingBranchId: state.batchesFilterByIssuingUnit.get('value') || null,
                batchName: state.batchesFilterByBatchName.get('value')
            },
            orderBy: state.batchGridOrder.update('fields', (list) => {
                return list.reduce((cur, direction, column) => {
                    return cur.push(Map({column, direction}));
                }, List());
            }).get('fields').toJS(),
            paging: {
                pageNumber: state.batchesPagination.get('pagination').get('pageNumber'),
                pageSize: state.batchesPagination.get('pagination').get('pageSize')
            },
            changeId:
                state.batchesFilterByStatus.get('changeId') +
                state.batchesFilterByProduct.get('changeId') +
                state.batchesFilterByTargetUnit.get('changeId') +
                state.batchesFilterByIssuingUnit.get('changeId') +
                state.batchesFilterByBatchName.get('changeId') +
                state.batchesPagination.get('changeId') +
                state.batchGridOrder.get('changeId') +
                state.noNameBatch.get('changeId') +
                state.batchStatusUpdatePopup.get('changeId') +
                state.batchDetails.get('changeId') +
                state.rejectDetails.get('changeId') +
                state.batchesGridColumnVisibility.get('changeId')
        };
    },
    {fetch, fetchBusinessUnits, handleDetailsOpen, order, check, checkSingle, multiCheck, handleToolboxSet, toggleColumn, setVisibleColumns, areAllCardsGeneratedUpdate, resetState, setDownloadLink}
)(BatchesGrid);
