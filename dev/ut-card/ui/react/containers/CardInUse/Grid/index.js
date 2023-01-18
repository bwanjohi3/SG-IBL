import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import GridBreadcrumbs from 'ut-core/ui/react/containers/GridBreadcrumbs';
import {fetch, check, multiCheck, cleanAndCheck, cleanChecked, toggleColumn, setVisibleColumns} from './actions';
import {order} from '../Order/actions';
import {show as toolboxSwitch} from '../GridToolbox/actions';
// import CurrentStatus from '../../../components/CurrentStatus';
import Text from 'ut-front-react/components/Text';
import {fetch as fetchDetails} from '../Details/actions';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import mainStyle from 'ut-front-react/assets/index.css';
import {Map, List, fromJS} from 'immutable';
import CircularProgress from 'material-ui/CircularProgress';

export class cardInUseGrid extends Component {
    constructor(props) {
        super(props);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleHeaderCheckboxSelect = this.handleHeaderCheckboxSelect.bind(this);
    }
    componentWillMount() {
        this.props.setVisibleColumns();
        this.props.fetch(this.props.filterValues, this.props.orderBy, this.props.paging);
    }
    componentWillReceiveProps(nextProps) { // fetch grid if there is some changes in filters
        if (this.props.changeId !== nextProps.changeId) {
            let paging = nextProps.paging;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                paging = {...nextProps.paging, pageNumber: 1};
            }
            this.props.fetch(nextProps.filterValues, nextProps.orderBy, paging);
        } else if (this.props.gridData.get('checkedRowsChangeId') !== nextProps.gridData.get('checkedRowsChangeId')) {
            if (nextProps.gridData.get('checkedRows').size > 0) {
                this.props.toolboxSwitch('button');
            } else {
                this.props.toolboxSwitch('filter');
            }
        }
    }
    handleCellClick(record, field, value, recordIndex) {
        if (field.name === 'cardNumber') {
            if (!this.context.checkPermission('card.cardInUse.get')) {
                return;
            }
            this.props.fetchDetails(record.cardId);
        } else {
            this.props.cleanAndCheck(recordIndex, record, false);
        }
    }
    handleCheckboxSelect(currentState, row, idx) {
        this.props.check(idx, row, currentState);
    }
    handleHeaderCheckboxSelect(currentState) {
        this.props.multiCheck(currentState);
    }
    handleOrder(result) {
        this.props.order(result.field, result.new);
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            switch (field.name) {
                case 'cardNumber':
                    return (<a> {value} </a>);
                case 'generatedPinMails':
                    return value || '0';
                case 'expirationDate':
                case 'temporaryLockEndDate':
                case 'activationDate':
                case 'lastModified':
                    return <DateFormatter>{value}</DateFormatter>;
                default:
                    return value;
            }
        }
    }
    render() {
        return (
            <div>
                <GridBreadcrumbs selectedId={this.props.filterValues.currentBranchId} breadcrumbs={this.props.breadcrumbs} />
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCellClick={this.handleCellClick}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleHeaderCheckboxSelect}
                      emptyRowsMsg={<Text>No result</Text>}
                      handleOrder={this.handleOrder}
                      rowsChecked={this.props.gridData.get('checkedRows').toList().toJS()}
                      fields={this.props.fields.filter((f) => (this.props.config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                      toggleColumnVisibility={this.props.toggleColumn}
                      orderBy={this.props.config.getIn(['grid', 'orderByFields']).toJS()}
                      transformCellValue={this.handleTransformCellValue}
                      data={(this.props.gridData.get('list') || List()).toJS()}
                    />

                    {this.props.gridData.get('isGridLoading') && <CircularProgress style={{display: 'block', margin: '40px auto 0px auto'}} size={45} />}
                </div>
            </div>
        );
    }
};

cardInUseGrid.propTypes = {
    toolboxSwitch: PropTypes.func.isRequired,
    cleanAndCheck: PropTypes.func.isRequired,
    check: PropTypes.func.isRequired,
    multiCheck: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired,
    cleanChecked: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    fetchDetails: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    orderBy: PropTypes.array.isRequired,
    config: PropTypes.object,
    fields: PropTypes.array.isRequired,
    changeId: PropTypes.number.isRequired,
    paginationChangeId: PropTypes.number.isRequired,
    filterValues: PropTypes.object.isRequired,
    paging: PropTypes.object.isRequired,
    gridData: PropTypes.object.isRequired,
    breadcrumbs: PropTypes.object.isRequired // immutable list
};

cardInUseGrid.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        let statusFilter = state.cardInUseFilterByStatus.get('value');
        let typeFilter = state.cardInUseFilterByType.get('value');
        let productFilter = state.cardInUseFilterByCardProduct.get('value');
        let issuingBusinessUnit = state.cardInUseFilterByIssuingBusinessUnit.get('value');

        return {
            config: state.cardConfig.get('cardsInUse'),
            fields: state.cardInUseGridColumnVisibility.get('fields').toJS(),
            gridData: (state.cardInUseGrid || Map()),
            filterValues: fromJS({
                statusId: statusFilter > 0 ? statusFilter : undefined,
                typeId: typeFilter > 0 ? typeFilter : undefined,
                productId: productFilter > 0 ? productFilter : undefined,
                issuingBranchId: issuingBusinessUnit > 0 ? issuingBusinessUnit : undefined
            })
            .update((v) => {
                if (parseInt(state.cardInUseFilterByBUSelection.get('businessUnitId'))) {
                    return v.set('currentBranchId', state.cardInUseFilterByBUSelection.get('businessUnitId'));
                }
                return v;
            })
            .update((v) => {
                let sf = state.cardInUseFilterByCustomSearch.get('field');
                let sv = state.cardInUseFilterByCustomSearch.get('value');
                if (sf && sv) {
                    return v.set(sf, sv);
                }
                return v;
            }).toJS(),
            orderBy: state.distributedGridOrder.update('fields', (list) => {
                return list.reduce((cur, direction, column) => {
                    return cur.push(Map({column, direction}));
                }, List());
            }).get('fields').toJS(),
            paging: (state.cardInUsePagination.get('pagination').filter((value, field) => {
                return ~field.indexOf('pageSize') || ~field.indexOf('pageNumber');
            }) || Map()).toJS(),
            breadcrumbs: state.cardInUseFilterByBUSelection.get('breadcrumbs'),
            changeId:
                state.cardInUseFilterByStatus.get('changeId') +
                state.cardInUseFilterByType.get('changeId') +
                state.cardInUseFilterByCardProduct.get('changeId') +
                state.cardInUseFilterByBUSelection.get('changeId') +
                state.cardInUseFilterClear.get('changeId') +
                state.distributedGridOrder.get('changeId') +
                state.cardInUseFilterByCustomSearch.get('changeId') +
                state.cardInUseFilterByIssuingBusinessUnit.get('changeId') +
                state.cardInUsePagination.get('changeId') +
                state.cardInUse.get('changeId') +
                state.cardInUseActionDialogScreens.get('changeId'),
            paginationChangeId: state.cardInUsePagination.get('changeId')
        };
    },
    {
        fetch,
        order,
        toolboxSwitch,
        check,
        multiCheck,
        fetchDetails,
        cleanAndCheck,
        cleanChecked,
        toggleColumn,
        setVisibleColumns
    }
)(cardInUseGrid);
