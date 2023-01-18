import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import immutable from 'immutable';
import CircularProgress from 'material-ui/CircularProgress';
import { fetchBins, checkBin, multiCheck, cleanAndCheck } from './actions';
import { fetchBinDetails } from './../Popups/Details/actions';
import {order} from './../Order/actions';
import { showButtons as showToolboxButtons, showFilters as showToolboxFilters } from './../GridToolbox/actions';

import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import Text from 'ut-front-react/components/Text';

import mainStyle from 'ut-front-react/assets/index.css';
import style from './../style.css';

class Grid extends Component {
    constructor(props) {
        super(props);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.getDetails = this.getDetails.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }

    componentWillMount() {
        this.props.fetchBins(this.props.filterValues, this.props.orderBy, this.props.paging);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.changeId !== nextProps.changeId) {
            let paging = nextProps.paging;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                paging = {...nextProps.paging, pageNumber: 1};
            }
            this.props.fetchBins(nextProps.filterValues, nextProps.orderBy, paging);
        } else if (this.props.checkedRowsChangeId !== nextProps.checkedRowsChangeId) {
            if (nextProps.checkedRows.size > 0) {
                this.props.showToolboxButtons();
            } else {
                this.props.showToolboxFilters();
            }
        }
    }
    handleOrder(result) {
        this.props.order(result.field, result.new);
    }
    handleCheckboxSelect(currentState, row, idx) {
        this.props.checkBin(idx, row, currentState);
    }
    handleCheckboxSelectAll(currentState) {
        this.props.multiCheck(currentState);
    }
    getDetails(record, field, value, recordIndex) {
        if (field.name === 'binId' && this.context.checkPermission('card.bin.get')) {
            this.props.fetchBinDetails(record.binId);
        } else {
            this.props.cleanAndCheck(recordIndex, record, false);
        }
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            if (field.name === 'binId') {
                return (<a> {value} </a>);
            } else if (field.name === 'isActive') {
                let status = value ? 'Active' : 'Inactive';
                return <Text>{status}</Text>;
            }
        }

        return value;
    }
    render() {
        let { bins, config } = this.props;
        return (
            <div>
                <div className={mainStyle.tableWrap} id={style.usersGrid}>
                    <SimpleGrid
                      multiSelect
                      emptyRowsMsg={<Text>No result</Text>}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      fields={this.props.fields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                      orderBy={config.getIn(['grid', 'orderByFields']).toJS()}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.getDetails}
                      data={bins.toJS()}
                      rowsChecked={this.props.checkedRows.toList().toJS()}
                      transformCellValue={this.handleTransformCellValue}
                    />
                    {this.props.isGridLoading && <CircularProgress style={{display: 'block', margin: '40px auto 0px auto'}} size={45} />}
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    bins: PropTypes.object.isRequired,
    checkedRows: PropTypes.object.isRequired,
    checkedRowsChangeId: PropTypes.number,
    isGridLoading: PropTypes.bool.isRequired,
    changeId: PropTypes.number.isRequired,
    paginationChangeId: PropTypes.number.isRequired,
    filterValues: PropTypes.object,
    orderBy: PropTypes.array,
    fields: PropTypes.array,
    paging: PropTypes.object,
    config: PropTypes.object,
    fetchBins: PropTypes.func.isRequired,
    checkBin: PropTypes.func.isRequired,
    multiCheck: PropTypes.func.isRequired,
    cleanAndCheck: PropTypes.func.isRequired,
    fetchBinDetails: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    showToolboxButtons: PropTypes.func.isRequired,
    showToolboxFilters: PropTypes.func.isRequired
};

Grid.contextTypes = {
    cards: PropTypes.object,
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    let changeId = state.cardBinsPagination.get('changeId') +
            state.cardBinsGridOrder.get('changeId') +
            state.cardBinCreate.get('changeId') +
            state.cardBinDetails.get('changeId') +
            state.cardBinsFilterByStatus.get('changeId') +
            state.cardBinsFilterClear.get('changeId');
    let filterValues = {
        isActive: Number.isInteger(state.cardBinsFilterByStatus.get('value')) ? state.cardBinsFilterByStatus.get('value') : null
    };

    return {
        config: state.cardConfig.get('cardBins'),
        bins: state.cardBinsGrid.get('bins'),
        checkedRows: state.cardBinsGrid.get('checkedRows'),
        checkedRowsChangeId: state.cardBinsGrid.get('checkedRowsChangeId'),
        isGridLoading: state.cardBinsGrid.get('isGridLoading'),
        filterValues: filterValues,
        fields: state.cardBinsGrid.get('fields').toJS(),
        orderBy: state.cardBinsGridOrder.update('fields', (list) => {
            return list.reduce((cur, direction, column) => {
                return cur.push(immutable.Map({column, direction}));
            }, immutable.List());
        }).get('fields').toJS(),
        paging: {
            pageNumber: state.cardBinsPagination.getIn(['pagination', 'pageNumber']),
            pageSize: state.cardBinsPagination.getIn(['pagination', 'pageSize'])
        },
        changeId: changeId,
        paginationChangeId: state.cardBinsPagination.get('changeId')
    };
}

export default connect(
    mapStateToProps,
    { fetchBins, checkBin, multiCheck, cleanAndCheck, fetchBinDetails, order, showToolboxButtons, showToolboxFilters }
)(Grid);
