import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { getLink } from 'ut-front/react/routerHelper';
import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';
import classnames from 'classnames';

import style from '../style.css';
import buttonStyles from '../../components/ActionStatusButton/style.css';
import mainStyle from 'ut-front-react/assets/index.css';

import Header from 'ut-front-react/components/PageLayout/Header';
import Text from 'ut-front-react/components/Text';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import DynamicContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import {toggle as toggleGridToolbox, show as showToolbox} from '../../containers/CardProduct/GridToolbox/actions';
import FilterByBusinessUnits from './../../containers/CardProduct/Filters/ByBusinessUnit';
import {ToolboxFilters, ToolboxButtons} from '../../containers/CardProduct/GridToolbox';

import ClearFilter from '../../containers/CardProduct/Filters/Clear';
import Pagination from '../../containers/CardProduct/Pagination';
import Grid from '../../containers/CardProduct/Grid';
import FilterByStatus from '../../containers/CardProduct/Filters/ByStatus';

import FilterByName from '../../containers/CardProduct/Filters/ByName';
import CreateDetail from '../../containers/CardProduct/Details/Create';
import EditDetail from '../../containers/CardProduct/Details/Edit';
import ActionStatusConfirmationDialog from '../../components/ActionStatusConfirmationDialog';
import {toggleCreateCardProductPopup} from '../../containers/CardProduct/Details/Create/actions';
import {editProduct, fetchCardProductById} from '../../containers/CardProduct/Details/Edit/actions';
import {multiCheck, selectItem, refetch, toggleProductStatus} from '../../containers/CardProduct/Grid/actions';

const defaultAsideWidth = 200;
const defaultAsideMinWidth = 100;
const defaultCollapsedWidth = 30;
let columnsWidths;

const createConfirmationMessage = <Text>Are you sure you want to save the changes?</Text>;

const getActionOnConfirm = (actionName) => {
    return {
        label: actionName.toLowerCase(),
        name: actionName
    };
};

class CardProduct extends Component {
    constructor(props) {
        super(props);
        this.handleToggleStatus = this.handleToggleStatus.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.closeConfirmation = this.closeConfirmation.bind(this);
        this.state = {
            isConfirmationOpen: false
        };
    }

    componentWillMount(props) {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }

    handleEdit() {
        const {fetchCardProductById, showToolbox} = this.props;
        let editProduct = this.props.checkedRows.get(0).toJS();
        fetchCardProductById(editProduct.productId);
        showToolbox('filter');
    }
    closeConfirmation() {
        this.setState({isConfirmationOpen: false});
    }
    handleToggleStatus() {
        if (this.state.isConfirmationOpen) {
            var checkedRows = this.props.checkedRows.toJS();
            this.props.toggleProductStatus(checkedRows);
            this.props.checkedRows.size > 0 && this.props.multiCheck(true);
            this.closeConfirmation();
        } else {
            this.setState({isConfirmationOpen: true});
        }
    }

    getDynamicCols() {
        let leftAside = (
            <div style={{minWidth: defaultAsideWidth}}>
                <FilterByBusinessUnits />
            </div>
        );

        let statusOptions = [
            {key: 1, name: 'Active'},
            {key: 0, name: 'Inactive'}
        ];

        let disabledEdit = (this.props.checkedRows && this.props.checkedRows.size !== 1) ? 'disabled' : '';
        let disabledToggle = (this.props.checkedRows && this.props.checkedRows.size > 0) ? (this.props.checkedRows.toJS().reduce((a, b) => { return (a.isActive === b.isActive) ? b : false; })) : false;
        let toggleButtonText = (this.props.checkedRows && this.props.checkedRows.size > 0) ? (this.props.checkedRows.get(0).toJS().isActive) ? 'Deactivate' : 'Activate' : 'Toggle Status';

        let {config} = this.props;
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                        <ToolboxFilters>
                            <div className={style.filterWrap}>
                                {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}>
                                    <FilterByStatus data={statusOptions} />
                                </div>}
                                {config.getIn(['filters', 'filterByName']) && <div className={style.filterSeparated}>
                                    <FilterByName onSearch={this.handleFilterByName} />
                                </div>}
                                    <ClearFilter />
                            </div>
                        </ToolboxFilters>
                        <ToolboxButtons>
                            <div className={style.buttonWrap}>
                                {this.context.checkPermission('card.product.get') && <button className={classnames(style.cardProductButton, disabledEdit ? buttonStyles.statusActionButtonDisabled : buttonStyles.statusActionButton)} disabled={disabledEdit} onClick={this.handleEdit}>
                                    Details
                                </button>}
                                {this.context.checkPermission('card.product.edit') && <button className={classnames(style.cardProductButton, !disabledToggle ? buttonStyles.statusActionButtonDisabled : buttonStyles.statusActionButton)} disabled={!disabledToggle} onClick={this.handleToggleStatus}>
                                   {toggleButtonText}
                                </button>}
                            </div>
                        </ToolboxButtons>
                    </div>
                <Grid />
                <Pagination />

                <CreateDetail />
                <EditDetail />
                <ActionStatusConfirmationDialog
                  open={this.state.isConfirmationOpen}
                  page='product'
                  action={getActionOnConfirm(toggleButtonText)}
                  confirmationMessage={createConfirmationMessage}
                  onSuccess={this.handleToggleStatus}
                  onCancel={this.closeConfirmation}
                />
            </div>
        );
        // TODO: check if it should be window.window.innerWidth - (defaultAsideWidth
        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);

        let asideStyles = {minWidth: defaultAsideWidth};
        let dynamicContainerCols = [
            {type: resizibleTypes.ASIDE, id: 'roleLeftAside', width: columnsWidths[0], normalWidth: defaultAsideWidth, minWidth: defaultAsideMinWidth, innerColStyles: {overflowX: 'hidden'}, collapsedWidth: defaultCollapsedWidth, child: leftAside, heading: 'Business Units', styles: asideStyles},
            {type: resizibleTypes.CONTENT, id: 'roleContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];

        return dynamicContainerCols;
    }
    getButtons() {
        let buttons = [];
        if (this.context.checkPermission('card.product.add')) {
            buttons.push({text: 'Create Product', onClick: this.props.toggleCreateCardProductPopup, styleType: 'primaryLight'});
        }

        return buttons;
    }
    render() {
        let dynamicContainerCols = this.getDynamicCols();
        let buttons = this.getButtons();
        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:cardProduct')} title='Card Products' />
                    <Header text={<Text>Card Products</Text>} buttons={buttons} />
                </div>
                <div>
                    <DynamicContainer cols={dynamicContainerCols} />
                </div>
            </div>
        );
    }
};

CardProduct.propTypes = {
    config: PropTypes.object,
    toggleCreateCardProductPopup: PropTypes.func.isRequired,
    toggleGridToolbox: PropTypes.func.isRequired,
    setEditItem: PropTypes.func,
    selectItem: PropTypes.func,
    checkedRows: PropTypes.object,
    editProduct: PropTypes.func,
    multiCheck: PropTypes.func,
    showToolbox: PropTypes.func,
    refetch: PropTypes.func,
    fetchCardProductById: PropTypes.func,
    toggleProductStatus: PropTypes.func
};

CardProduct.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state, ownProps) => {
        return {
            config: state.cardConfig.get('cardProducts'),
            opened: state.createCardProduct.get('isOpen'),
            checkedRows: state.cardProductGrid.get('checkedRows')
        };
    },
    {toggleCreateCardProductPopup, toggleGridToolbox, fetchCardProductById, multiCheck, selectItem, showToolbox, editProduct, refetch, toggleProductStatus}
)(CardProduct);
