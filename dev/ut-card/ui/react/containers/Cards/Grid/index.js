import React, { Component, PropTypes } from 'react';
import immutable from 'immutable';
import { connect } from 'react-redux';
import { fetchCards, checkCard, checkAll, clearAndCheck, selectCard, toggleColumn, setVisibleColumns } from './actions';
// import CurrentStatus from '../../../components/CurrentStatus';

import Text from 'ut-front-react/components/Text';
import { SimpleGrid } from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import GridBreadcrumbs from 'ut-core/ui/react/containers/GridBreadcrumbs';

import CircularProgress from 'material-ui/CircularProgress';

import {show as toolboxSwitch} from '../GridToolbox/actions';

import { toggleCardDetails } from '../ActionDialogScreens/Details/actions';
import { order } from '../Filters/Order/actions';

import mainStyle from 'ut-front-react/assets/index.css';

class CardsGrid extends Component {
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
        let { fetchCards, filterValues, setVisibleColumns } = this.props;
        setVisibleColumns();
        fetchCards(filterValues);
    }
    componentWillReceiveProps(nextProps) { // fetch grid if there is some changes in filters
        if (this.props.changeId !== nextProps.changeId) {
            let filters = nextProps.filterValues;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                filters = filters.setIn(['byPage', 'pageNumber'], 1);
            }
            this.props.fetchCards(filters);
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
        let { filterValues, fetchCards } = this.props;

        fetchCards(filterValues);
    }
    handleCheckboxSelect(currentVal, card) {
        this.props.checkCard(currentVal, card);
    }
    handleCheckboxSelectAll(currentVal) {
        let cards = this.props.gridProps.get('data');
        this.props.checkAll(currentVal, cards);
    }
    handleCellClick(rowData, cellKey) {
        if (cellKey.name === 'cardNumber') {
            if (!this.context.checkPermission('card.cardInProduction.get')) {
                return;
            }
            this.props.selectCard(rowData);
            this.props.toggleCardDetails();
        } else {
            this.props.clearAndCheck(rowData);
        }
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            switch (field.name) {
                case 'generatedPinMails':
                    return value || '0';
                case 'cardNumber':
                    return (<a> {value} </a>);
                case 'acceptanceDate':
                    return <DateFormatter>{value}</DateFormatter>;
                case 'expirationDate':
                    return <DateFormatter>{value}</DateFormatter>;
                default:
                    return value;
            }
        }
    }

    render() {
        let { fields, config, gridProps, filterValues, breadcrumbs } = this.props;

        return (
            <div>
                <GridBreadcrumbs selectedId={filterValues.get('byBusinessUnit')} breadcrumbs={breadcrumbs} />
                <div className={mainStyle.tableWrap} >
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      handleCellClick={this.handleCellClick}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                      emptyRowsMsg={<Text>No result</Text>}
                      toggleColumnVisibility={this.props.toggleColumn}
                      fields={fields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
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

CardsGrid.propTypes = {
    config: PropTypes.object,
    // Data
    gridProps: PropTypes.object.isRequired, // immutable object
    filterValues: PropTypes.object.isRequired, // immutable object
    fields: PropTypes.array.isRequired,
    changeId: PropTypes.number.isRequired,
    paginationChangeId: PropTypes.number.isRequired,
    breadcrumbs: PropTypes.object.isRequired, // immutable list
    // Actions
    toggleColumn: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    fetchCards: PropTypes.func.isRequired,
    checkCard: PropTypes.func.isRequired,
    checkAll: PropTypes.func.isRequired,
    clearAndCheck: PropTypes.func.isRequired,
    selectCard: PropTypes.func.isRequired,
    toggleCardDetails: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    toolboxSwitch: PropTypes.func.isRequired
};

CardsGrid.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    ({
        cardConfig,
        cardManagementGrid,
        cardManagementFilterByCardProduct,
        cardManagementFilterByStatus,
        cardManagementFilterByPage,
        cardManagementFilterByCustomSearch,
        cardManagementFilterByBusinessUnitSelection,
        cardManagementFilterByBusinessUnit,
        cardManagementFilterByIssuingBusinessUnit,
        cardManagementFilterByTargetBusinessUnit,
        cardManagementFilterClear,
        cardsGridOrder,
        cardInProductionGridColumnVisibility,
        cardActionDialogScreens
    }) => {
        return {
            config: cardConfig.get('cards'),
            gridProps: cardManagementGrid,
            fields: cardInProductionGridColumnVisibility.get('fields').toJS(),
            filterValues: immutable.fromJS({
                byProduct: cardManagementFilterByCardProduct.get('value') > 0 ? cardManagementFilterByCardProduct.get('value') : undefined,
                byStatus: cardManagementFilterByStatus.get('value') > 0 ? cardManagementFilterByStatus.get('value') : undefined,
                byPage: cardManagementFilterByPage.get('pagination'),
                issuingBusinessUnitId: cardManagementFilterByIssuingBusinessUnit.get('value') > 0 ? cardManagementFilterByIssuingBusinessUnit.get('value') : undefined,
                byCustomSearch: {
                    field: cardManagementFilterByCustomSearch.get('field'),
                    value: cardManagementFilterByCustomSearch.get('value')
                },
                byBusinessUnit: cardManagementFilterByBusinessUnitSelection.get('businessUnitId'),
                byTargetBusinessUnit: cardManagementFilterByTargetBusinessUnit.get('value') > 0 ? cardManagementFilterByTargetBusinessUnit.get('value') : undefined,
                orderBy: cardsGridOrder.update('fields', (list) => {
                    return list.reduce((cur, direction, column) => {
                        return cur.push(immutable.Map({column, direction}));
                    }, immutable.List());
                }).get('fields').toJS()
            }),
            breadcrumbs: cardManagementFilterByBusinessUnitSelection.get('breadcrumbs'),
            changeId:
                (cardManagementFilterByCardProduct.get('changeId') +
                cardManagementFilterByStatus.get('changeId') +
                cardManagementFilterByPage.get('changeId') +
                cardManagementFilterByCustomSearch.get('changeId') +
                cardManagementFilterByBusinessUnitSelection.get('changeId') +
                cardManagementFilterByTargetBusinessUnit.get('changeId') +
                cardManagementFilterByIssuingBusinessUnit.get('changeId') +
                cardManagementFilterClear.get('changeId') +
                cardsGridOrder.get('changeId') +
                cardActionDialogScreens.get('changeId')),
            paginationChangeId: cardManagementFilterByPage.get('changeId')
        };
    },
    { fetchCards, checkCard, checkAll, clearAndCheck, selectCard, toggleCardDetails, order, toolboxSwitch, toggleColumn, setVisibleColumns }
)(CardsGrid);
