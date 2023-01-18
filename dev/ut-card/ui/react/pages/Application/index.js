import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import Header from 'ut-front-react/components/PageLayout/Header';
import { getLink } from 'ut-front/react/routerHelper';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import localStorageTypes from 'ut-front-react/components/ResiziblePageLayout/localStorageTypes';
import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';
import Text from 'ut-front-react/components/Text';
import mainStyle from 'ut-front-react/assets/index.css';

import FilterByBusinessUnits from './../../containers/Applications/Filters/ByBusinessUnit';
import Grid from './../../containers/Applications/Grid';
import {ToolboxFilters, ToolboxButtons} from './../../containers/Applications/GridToolbox';
import FilterByStatus from './../../containers/Applications/Filters/ByStatus';
import FilterByCardType from './../../containers/Applications/Filters/ByCardType';
import FilterByProduct from './../../containers/Applications/Filters/ByProduct';
import FilterByIssuingBusinessUnit from './../../containers/Applications/Filters/ByIssuingBusinessUnit';
import FilterByCustomSearch from './../../containers/Applications/Filters/ByCustomSearch';
import ClearFilter from './../../containers/Applications/Filters/Clear';

import GridToolboxButtons from './../../containers/Applications/GridToolboxButtons';

import Pagination from './../../containers/Applications/Pagination';
import Details from './../../containers/Applications/Popups/Details';
import NoNameApplicationCreate from './../../containers/Applications/NoNameApplicationCreate';
import NameApplicationCreate from './../../containers/Applications/NameApplicationCreate';
import CreateBatch from './../../containers/Applications/Popups/CreateBatch';
import AddToExistingBatch from './../../containers/Applications/Popups/AddToExistingBatch';
import ActionWithReason from './../../containers/Applications/Popups/ActionWithReason';
import ConfirmAction from './../../containers/Applications/Popups/ConfirmAction';

import {handleNoNameCreateDialogToggle} from './../../containers/Applications/NoNameApplicationCreate/actions';
import {handleNameDialogToggle} from './../../containers/Applications/NameApplicationCreate/actions';

import style from '../style.css';

const defaultAsideWidth = 200;
const defaultAsideMinWidth = 100;
const defaultCollapsedWidth = 30;
let columnsWidths;

class Application extends Component {
    componentWillMount(props) {
        columnsWidths = getLocalStorageStoredColumnWidths(localStorageTypes.TWO_COLS);
    }
    checkUsedType(type) {
        return this.props.usedCardTypes === 'both' || this.props.usedCardTypes === type;
    }
    getResizibleCols() {
        let leftAside = (
            <div style={{minWidth: defaultAsideWidth}}>
                <FilterByBusinessUnits />
            </div>
        );
        let {config, usedCardTypes} = this.props;
        let filterByCustomSearch = config.getIn(['filters', 'filterByCustomSearch']);
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <div className={style.filterWrap}>
                            {usedCardTypes === 'both' && config.getIn(['filters', 'filterByCardType']) && <div className={style.filterSeparated}><FilterByCardType /></div>}
                            {config.getIn(['filters', 'filterByProduct']) && <div className={style.filterSeparated}><FilterByProduct /></div>}
                            {config.getIn(['filters', 'filterByIssuingBU']) && <div className={style.filterSeparated}><FilterByIssuingBusinessUnit /></div>}
                            {this.props.statusesCount > 1 && config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}><FilterByStatus /></div>}
                            {filterByCustomSearch && filterByCustomSearch.size > 0 && <div className={style.filterCustomSearchSeparated}><FilterByCustomSearch allowedFields={filterByCustomSearch.get('fields')} defaultField={filterByCustomSearch.get('defaultField')} /></div>}
                            <div><ClearFilter /></div>
                        </div>
                    </ToolboxFilters>
                    <ToolboxButtons>
                        <div className={style.buttonWrap}>
                            <GridToolboxButtons />
                        </div>
                    </ToolboxButtons>
                </div>
                <Grid />
                <Pagination />
            </div>
        );
        let contentNormalWidth = window.window.innerWidth - defaultAsideWidth;

        let asideStyles = {minWidth: defaultAsideWidth};
        let resizibleContainerCols = [
            {type: resizibleTypes.ASIDE, id: 'roleLeftAside', width: columnsWidths[0], normalWidth: defaultAsideWidth, minWidth: defaultAsideMinWidth, innerColStyles: {overflowX: 'hidden'}, collapsedWidth: defaultCollapsedWidth, child: leftAside, heading: 'Business Units', styles: asideStyles},
            {type: resizibleTypes.CONTENT, id: 'roleContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];

        return resizibleContainerCols;
    }
    getButtons() {
        let buttons = [];
        if (this.context.checkPermission('card.noNameApplication.add') && this.checkUsedType('noNamed')) {
            buttons.push({text: 'Create No Name Application', onClick: this.props.handleNoNameCreateDialogToggle});
        }
        if (this.context.checkPermission('card.application.add') && this.checkUsedType('named')) {
            buttons.push({text: 'Create Name Application', onClick: this.props.handleNameDialogToggle});
        }

        return buttons;
    }
    render() {
        let resizibleContainerCols = this.getResizibleCols();
        let buttons = this.getButtons();
        return (
            <div>
                <AddTab pathname={getLink('ut-card:application')} title='Card Applications' />
                <Header text={<Text>Applications</Text>} buttons={buttons} />
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} localStorageType={localStorageTypes.TWO_COLS} />
                </div>
                <Details />
                <NoNameApplicationCreate />
                <NameApplicationCreate />
                <CreateBatch />
                <AddToExistingBatch />
                {this.props.actionWithReasonOpen && <ActionWithReason />}
                {this.props.confirmationOpen && <ConfirmAction />}
            </div>
        );
    }
};

Application.propTypes = {
    statusesCount: PropTypes.number,
    actionWithReasonOpen: PropTypes.bool.isRequired,
    usedCardTypes: PropTypes.string.isRequired,
    config: PropTypes.object,
    confirmationOpen: PropTypes.bool.isRequired,
    handleNameDialogToggle: PropTypes.func.isRequired,
    handleNoNameCreateDialogToggle: PropTypes.func.isRequired
};

Application.contextTypes = {
    cards: PropTypes.object,
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            usedCardTypes: state.cardConfig.get('usedCardTypes'),
            config: state.cardConfig.get('application'),
            statusesCount: state.utCardStatusAction.get('filter-application').length,
            actionWithReasonOpen: state.cardApplicationActionWithReason.get('open'),
            confirmationOpen: state.cardApplicationConfirmActionPopup.get('open')
        };
    },
    {handleNameDialogToggle, handleNoNameCreateDialogToggle}
)(Application);
