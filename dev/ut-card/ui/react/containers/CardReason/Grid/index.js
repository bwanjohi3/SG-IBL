import React, { Component, PropTypes } from 'react';
import immutable from 'immutable';
import { connect } from 'react-redux';
import { fetchReasons, check, checkAll, clearAndCheck, select, toggleColumn, setVisibleColumns } from './actions';

import Text from 'ut-front-react/components/Text';
import { SimpleGrid } from 'ut-front-react/components/SimpleGrid';

import CircularProgress from 'material-ui/CircularProgress';

import {show as toolboxSwitch} from '../GridToolbox/actions';
import {toggle as toggleEdit} from '../DialogScreens/Edit/actions';

import { order } from '../Filters/ByOrder/actions';

import mainStyle from 'ut-front-react/assets/index.css';

class CardReasonGrid extends Component {
    constructor(props) {
        super(props);
        this.handleSort = this.handleSort.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }
    componentWillMount() {
        let { fetchReasons, filterValues, setVisibleColumns } = this.props;
        setVisibleColumns();
        fetchReasons(filterValues);
    }
    componentWillReceiveProps(nextProps) { // fetch grid if there is some changes in filters
        if (this.props.changeId !== nextProps.changeId) {
            let filters = nextProps.filterValues;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                filters = filters.setIn(['byPage', 'pageNumber'], 1);
            }
            this.props.fetchReasons(filters);
        } else if (this.props.gridProps.get('checkedRowsChangeId') !== nextProps.gridProps.get('checkedRowsChangeId')) {
            if (nextProps.gridProps.get('checked').size > 0) {
                this.props.toolboxSwitch('button');
            } else {
                this.props.toolboxSwitch('filter');
            }
        }
    }
    handleSort(result) {
        let { order } = this.props;
        order(result.field, result.new);
    }
    handleRefresh() {
        let { filterValues, fetchReasons } = this.props;

        fetchReasons(filterValues);
    }
    handleCheckboxSelect(currentVal, row) {
        this.props.check(currentVal, row);
    }
    handleCheckboxSelectAll(currentVal) {
        let rows = this.props.gridProps.get('data');
        this.props.checkAll(currentVal, rows);
    }
    handleCellClick(rowData, cellKey) {
        if (cellKey.name === 'reasonName') {
            if (!this.context.checkPermission('card.reason.get')) {
                return;
            }
            this.props.select(rowData);
            this.props.toggleEdit();
        } else {
            this.props.clearAndCheck(rowData);
        }
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            if (field.name === 'module') {
                if (value === 'Card') {
                    value = 'Cards in Production';
                } else if (value === 'CardInUse') {
                    value = 'Cards in Use';
                }
                return (<Text>{value}</Text>);
            } else if (field.name === 'isActive') {
                return value ? 'Active' : 'Inactive';
            } else if (field.name === 'reasonName') {
                return <a>{value}</a>;
            }
        }
        return value;
    }
    render() {
        let { config, gridFields, gridProps } = this.props;

        return (
            <div>
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      toggleColumnVisibility={this.props.toggleColumn}
                      handleCellClick={this.handleCellClick}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      emptyRowsMsg={<Text>No result</Text>}
                      fields={gridFields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                      orderBy={config.getIn(['grid', 'orderByFields']).toJS()}
                      handleOrder={this.handleSort}
                      transformCellValue={this.handleTransformCellValue}
                      rowsChecked={this.props.gridProps.get('checked').toJS()}
                      data={gridProps.get('data').toJS()}
                    />

                    {gridProps.get('isGridLoading') && <CircularProgress style={{display: 'block', margin: '40px auto 0px auto'}} size={45} />}
                </div>
            </div>
        );
    }
};

CardReasonGrid.propTypes = {
    config: PropTypes.object,
    // Data
    gridProps: PropTypes.object.isRequired, // immutable object
    filterValues: PropTypes.object.isRequired, // immutable object
    gridFields: PropTypes.array.isRequired,
    changeId: PropTypes.number.isRequired,
    paginationChangeId: PropTypes.number.isRequired,
    // Actions
    fetchReasons: PropTypes.func.isRequired,
    check: PropTypes.func.isRequired,
    checkAll: PropTypes.func.isRequired,
    clearAndCheck: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    toolboxSwitch: PropTypes.func.isRequired,
    toggleEdit: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired
};

CardReasonGrid.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    ({
        cardConfig,
        cardReasonGrid,
        cardReasonGridColumnVisibility,
        cardReasonGridOrder,
        cardReasonFilterByModule,
        cardReasonFilterByAction,
        cardReasonFilterByStatus,
        cardReasonFilterByReasonName,
        cardReasonFilterByPage,
        cardReasonFilterClear,
        cardReasonDialogScreens
    }) => {
        return {
            config: cardConfig.get('cardReasons'),
            gridProps: cardReasonGrid,
            gridFields: cardReasonGridColumnVisibility.get('fields').toJS(),
            filterValues: immutable.fromJS({
                byModule: cardReasonFilterByModule.get('value') || undefined,
                byAction: cardReasonFilterByAction.get('value') > 0 ? cardReasonFilterByAction.get('value') : undefined,
                byStatus: cardReasonFilterByStatus.get('value') >= 0 ? cardReasonFilterByStatus.get('value') : undefined,
                byPage: cardReasonFilterByPage.get('pagination'),
                orderBy: cardReasonGridOrder.update('fields', (list) => {
                    return list.reduce((cur, direction, column) => {
                        return cur.push(immutable.Map({column, direction}));
                    }, immutable.List());
                }).get('fields').toJS(),
                byReasonName: cardReasonFilterByReasonName.get('value') || undefined
            }),
            changeId:
                cardReasonFilterByModule.get('changeId') +
                cardReasonFilterByAction.get('changeId') +
                cardReasonFilterByStatus.get('changeId') +
                cardReasonFilterByReasonName.get('changeId') +
                cardReasonFilterByPage.get('changeId') +
                cardReasonFilterClear.get('changeId') +
                cardReasonGridOrder.get('changeId') +
                cardReasonDialogScreens.get('changeId'),
            paginationChangeId: cardReasonFilterByPage.get('changeId')
        };
    },
    { fetchReasons, check, checkAll, clearAndCheck, select, toolboxSwitch, order, toggleEdit, toggleColumn, setVisibleColumns }
)(CardReasonGrid);
