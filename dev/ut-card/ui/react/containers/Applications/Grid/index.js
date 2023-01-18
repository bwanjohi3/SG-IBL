import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import immutable from 'immutable';
import CircularProgress from 'material-ui/CircularProgress';
import { fetchApplications, setVisibleColumns, toggleVisibleColumn, checkApplication, multiCheck, cleanAndCheck } from './actions';
import { fetchCustomerDetails } from './../Popups/Details/actions';
import {order} from './../Order/actions';
import { showButtons as showToolboxButtons, showFilters as showToolboxFilters } from './../GridToolbox/actions';

import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import GridBreadcrumbs from 'ut-core/ui/react/containers/GridBreadcrumbs';
import Text from 'ut-front-react/components/Text';

import mainStyle from 'ut-front-react/assets/index.css';
import style from './style.css';

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
        this.props.setVisibleColumns();
        this.props.fetchApplications(this.props.filterValues, this.props.orderBy, this.props.paging);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.changeId !== nextProps.changeId) {
            let paging = nextProps.paging;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                paging = {...nextProps.paging, pageNumber: 1};
            }
            this.props.fetchApplications(nextProps.filterValues, nextProps.orderBy, paging);
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
        this.props.checkApplication(idx, row, currentState);
    }
    handleCheckboxSelectAll(currentState) {
        this.props.multiCheck(currentState);
    }
    getDetails(record, field, value, recordIndex) {
        if (field.name === 'applicationId' && this.context.checkPermission('card.application.get')) {
            this.props.fetchCustomerDetails(record.applicationId);
        } else {
            this.props.cleanAndCheck(recordIndex, record, false);
        }
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            if (field.name === 'applicationId') {
                return (<a> {value} </a>);
            } else if (field.name === 'createdOn') {
                return (<DateFormatter>{value}</DateFormatter>);
            }
        }

        return value;
    }
    render() {
        let { applications, config } = this.props;
        return (
            <div>
                <GridBreadcrumbs selectedId={this.props.filterValues.currentBranchId} breadcrumbs={this.props.breadcrumbs} />
                <div className={mainStyle.tableWrap} id={style.usersGrid}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      emptyRowsMsg={<Text>No result</Text>}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      fields={this.props.fields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                      toggleColumnVisibility={this.props.toggleVisibleColumn}
                      orderBy={config.getIn(['grid', 'orderByFields']).toJS()}
                      handleOrder={this.handleOrder}
                      handleCellClick={this.getDetails}
                      data={applications.toJS()}
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
    applications: PropTypes.object.isRequired,
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
    breadcrumbs: PropTypes.object.isRequired, // immutable list
    fetchApplications: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    toggleVisibleColumn: PropTypes.func.isRequired,

    checkApplication: PropTypes.func.isRequired,
    multiCheck: PropTypes.func.isRequired,
    cleanAndCheck: PropTypes.func.isRequired,
    fetchCustomerDetails: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    showToolboxButtons: PropTypes.func.isRequired,
    showToolboxFilters: PropTypes.func.isRequired
};

Grid.contextTypes = {
    cards: PropTypes.object,
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    let changeId = state.cardApplicationsGrid.get('changeId') +
            state.cardApplicationsPagination.get('changeId') +
            state.cardApplicationsGridOrder.get('changeId') +
            state.cardApplicationsFilterByBusinessUnitSelection.get('changeId') +
            state.cardApplicationsFilterByCardType.get('changeId') +
            state.cardApplicationsFilterByCustomSearch.get('changeId') +
            state.cardApplicationsFilterByStatus.get('changeId') +
            state.cardApplicationsFilterByProduct.get('changeId') +
            state.cardApplicationsFilterByIssuingBusinessUnit.get('changeId') +
            state.cardApplicationsFilterClear.get('changeId');
    let filterValues = {
        embossedTypeId: state.cardApplicationsFilterByCardType.get('value') || null,
        statusId: state.cardApplicationsFilterByStatus.get('value') || null,
        productId: state.cardApplicationsFilterByProduct.get('value') || null,
        issuingBranchId: state.cardApplicationsFilterByIssuingBusinessUnit.get('value') || null,
        currentBranchId: state.cardApplicationsFilterByBusinessUnitSelection.get('businessUnitId') || null
    };

    if (state.cardApplicationsFilterByCustomSearch.get('field')) {
        filterValues[state.cardApplicationsFilterByCustomSearch.get('field')] = state.cardApplicationsFilterByCustomSearch.get('value') || null;
    }
    return {
        config: state.cardConfig.get('application'),
        applications: state.cardApplicationsGrid.get('applications'),
        checkedRows: state.cardApplicationsGrid.get('checkedRows'),
        checkedRowsChangeId: state.cardApplicationsGrid.get('checkedRowsChangeId'),
        isGridLoading: state.cardApplicationsGrid.get('isGridLoading'),
        filterValues: filterValues,
        fields: state.cardApplicationsGrid.get('fields').toJS(),
        orderBy: state.cardApplicationsGridOrder.update('fields', (list) => {
            return list.reduce((cur, direction, column) => {
                return cur.push(immutable.Map({column, direction}));
            }, immutable.List());
        }).get('fields').toJS(),
        paging: {
            pageNumber: state.cardApplicationsPagination.getIn(['pagination', 'pageNumber']),
            pageSize: state.cardApplicationsPagination.getIn(['pagination', 'pageSize'])
        },
        breadcrumbs: state.cardApplicationsFilterByBusinessUnitSelection.get('breadcrumbs'),
        changeId: changeId,
        paginationChangeId: state.cardApplicationsPagination.get('changeId')
    };
}

export default connect(
    mapStateToProps,
    { fetchApplications, setVisibleColumns, toggleVisibleColumn, checkApplication, multiCheck, cleanAndCheck, fetchCustomerDetails, order, showToolboxButtons, showToolboxFilters }
)(Grid);
