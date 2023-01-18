import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import Text from 'ut-front-react/components/Text';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
// import GridBreadcrumbs from 'ut-core/ui/react/containers/GridBreadcrumbs';
import DateFormatter from 'ut-front-react/containers/DateFormatter';

import {fetch, check, multiCheck, toggleColumn, setVisibleColumns} from './actions';
import {show} from '../GridToolbox/actions';
import {changeOrderFilter} from '../Filters/ByOrder/actions';
import {setEditMode} from '../Details/actions';

import mainStyle from 'ut-front-react/assets/index.css';

export class CardTypeGrid extends Component {
    constructor(props) {
        super(props);
        this.removeNullPropertiesFromObject = this.removeNullPropertiesFromObject.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }

    componentWillMount() {
        let {fetch, paging, setVisibleColumns} = this.props;

        setVisibleColumns();
        fetch({}, {}, paging || {
            pageSize: 25,
            pageNumber: 1
        });
    }

    componentWillReceiveProps(nextProps) {
        let {changeId, checkedRows, multiCheck, fetch, show} = this.props;
        if (nextProps.changeId !== changeId) {
            checkedRows.size > 0 && multiCheck(true);
            let filterBy = nextProps.filterBy;
            let orderBy = nextProps.orderBy;
            let paging = nextProps.paging;
            this.removeNullPropertiesFromObject(filterBy);
            this.removeNullPropertiesFromObject(orderBy);
            fetch(filterBy, orderBy, paging);
        } else if (this.props.checkedRowsChangeId !== nextProps.checkedRowsChangeId) {
            if (nextProps.checkedRows.length > 0) {
                show('button');
            } else {
                show('filter');
            }
        }
    }

    removeNullPropertiesFromObject(obj) {
        return Object.keys(obj).forEach((key) =>
                (obj[key] === '' || obj[key] === '__placeholder__' || obj[key] === undefined || obj[key] === null || obj[key] === 0) && delete obj[key]);
    }

    handleCheckboxSelect(currentState, row, idx) {
        const {check} = this.props;
        check({row, currentState});
    }

    handleCellClick(row, field, value) {
        const {check} = this.props;
        if (field.name === 'name') {
            this.props.setEditMode({typeId: row.typeId});
        } else {
            check({row, currentState: false, cleanup: true});
        }
    }

    handleOrder(result) {
        this.props.changeOrderFilter(result.field, result.new);
    }

    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else if (field.name === 'name') {
            return (<a> {value}</a>);
        } else if (field.name === 'startDate' || field.name === 'endDate') {
            return (<DateFormatter>{value}</DateFormatter>);
        } else if (field.name === 'isActive') {
            let textToShow = value ? 'Active' : 'Inactive';
            return <Text>{textToShow}</Text>;
        } else if (field.name === 'generateControlDigit') {
            let textToShow = data.generateControlDigit === null ? ''
                : data.generateControlDigit === true ? 'Yes'
                : 'No';
            return <Text>{textToShow}</Text>;
        }
        return value;
    }

    render() {
        return (
            <div>
                {/* <GridBreadcrumbs selectedId={this.props.filterBy.businessUnitId} breadcrumbs={this.props.breadcrumbs} /> */}
                <div className={mainStyle.tableWrap}>
                    <SimpleGrid
                      multiSelect
                      globalMenu
                      toggleColumnVisibility={this.props.toggleColumn}
                      handleCellClick={this.handleCellClick}
                      handleHeaderCheckboxSelect={this.props.multiCheck}
                      handleCheckboxSelect={this.handleCheckboxSelect}
                      emptyRowsMsg={<Text>No result</Text>}
                      rowsChecked={this.props.checkedRows}
                      handleOrder={this.handleOrder}
                      fields={this.props.fields.filter((f) => (this.props.config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                      transformCellValue={this.handleTransformCellValue}
                      orderBy={this.props.config.getIn(['grid', 'orderByFields']).toJS()}
                      data={this.props.tableData}
                    />
                </div>
            </div>
        );
    }
};

CardTypeGrid.contextTypes = {
    dateFormat: PropTypes.func
};

CardTypeGrid.propTypes = {
    config: PropTypes.object,
    check: PropTypes.func,
    fetch: PropTypes.func,
    toggleColumn: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    changeId: PropTypes.number,
    tableData: PropTypes.any,
    checkedRows: PropTypes.any,
    checkedRowsChangeId: PropTypes.number,
    multiCheck: PropTypes.func,
    show: PropTypes.func,
    changeOrderFilter: PropTypes.func,
    filterBy: PropTypes.object,
    fields: PropTypes.array,
    orderBy: PropTypes.object,
    paging: PropTypes.object,
    // toolboxFilter: PropTypes.bool,
    // breadcrumbs: PropTypes.object.isRequired,
    setEditMode: PropTypes.func
};

export default connect(
    (state) => {
        return {
            config: state.cardConfig.get('cardTypes'),
            // toolboxFilter: state.cardProductToolbox.getIn(['filters', 'opened']),
            tableData: state.cardTypeGrid.getIn(['data', 'type']) ? state.cardTypeGrid.getIn(['data', 'type']).toJS() : [],
            checkedRows: state.cardTypeGrid.get('checkedRows').toJS(),
            checkedRowsChangeId: state.cardTypeGrid.get('checkedRowsChangeId'),
            changeId: state.cardTypeStatusFilter.get('changeId') +
                      state.cardTypeOrderFilter.get('changeId') +
                      state.cardTypeNameFilter.get('changeId') +
                      state.cardTypeGrid.get('changeId') +
                      state.cardTypeFilterClear.get('changeId') +
                      state.cardTypeBusinessUnitFilter.get('changeId'),
            filterBy: {
                typeName: state.cardTypeNameFilter.get('typeName'),
                isActive: state.cardTypeStatusFilter.get('isActive'),
                businessUnitId: state.cardTypeBusinessUnitFilter.get('businessUnitId')
            },
            fields: state.cardTypeGridColumnVisibility.get('fields').toJS(),
            orderBy: state.cardTypeOrderFilter.get('orderBy') ? state.cardTypeOrderFilter.get('orderBy').toJS() : {},
            paging: state.cardTypeGrid.get('pagination') ? state.cardTypeGrid.get('pagination').toJS() : []
            // breadcrumbs: state.cardTypeBusinessUnitFilter.get('breadcrumbs')
        };
    },
    {fetch, check, multiCheck, show, changeOrderFilter, setEditMode, toggleColumn, setVisibleColumns}
)(CardTypeGrid);
