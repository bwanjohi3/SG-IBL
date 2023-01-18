import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { getLink } from 'ut-front/react/routerHelper';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import { getLocalStorageStoredColumnWidths, buildBUText } from 'ut-core/ui/react/helpers';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import DynamicContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import Text from 'ut-front-react/components/Text';
import mainStyle from 'ut-front-react/assets/index.css';
import Grid from '../../containers/CardInUse/Grid';
import FilterByStatus from '../../containers/CardInUse/Filters/ByStatus';
import FilterByProduct from '../../containers/CardInUse/Filters/ByProduct';
// import FilterByType from '../../containers/CardInUse/Filters/ByType';
import FilterCustomSearch from '../../containers/CardInUse/Filters/ByCustomSearch';
import FilterByBusinessUnits from './../../containers/CardInUse/Filters/ByBusinessUnit';
import FilterByIssuingBusinessUnit from '../../containers/CardInUse/Filters/ByIssuingBusinessUnit';
// import CardAttributes from './../../containers/CardInUse/CardAttributes';
import {ToolboxFilters, ToolboxButtons} from '../../containers/CardInUse/GridToolbox';
import Pagination from '../../containers/CardInUse/Pagination';
import Buttons from '../../containers/CardInUse/ActionButtons';
import ActionDialogScreens from '../../containers/CardInUse/ActionDialogScreens';
import ClearFilters from '../../containers/CardInUse/Filters/Clear';
import style from '../style.css';

const defaultAsideWidth = 200;
const defaultAsideMinWidth = 100;
const defaultCollapsedWidth = 30;
let columnsWidths;

class CardInUse extends Component {
    componentWillMount(props) {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    getDynamicCols() {
        let leftAside = (
            <div style={{minWidth: defaultAsideWidth}}>
                <FilterByBusinessUnits />
            </div>
        );
        // let rightAside = (
        //     <div style={{minWidth: defaultAsideWidth}}>
        //         <CardAttributes />
        //     </div>
        // );
        let {config} = this.props;
        let filterByCustomSearch = config.getIn(['filters', 'filterByCustomSearch']);
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <div className={style.filterWrap}>
                            {config.getIn(['filters', 'filterByProduct']) && <div className={style.filterSeparated}><FilterByProduct /></div>}
                            {config.getIn(['filters', 'filterByIssuingBU']) && <div className={style.filterSeparated}> <FilterByIssuingBusinessUnit /> </div>}
                            {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}><FilterByStatus /></div>}
                            {filterByCustomSearch && filterByCustomSearch.size > 0 && <div className={style.filterCustomSearchSeparated}><FilterCustomSearch allowedFields={filterByCustomSearch.get('fields')} defaultField={filterByCustomSearch.get('defaultField')} /></div>}
                            <div><ClearFilters /></div>
                        </div>
                    </ToolboxFilters>
                    <ToolboxButtons>
                        <div className={style.buttonWrap}>
                            <Buttons toolbox />
                        </div>
                    </ToolboxButtons>
                </div>

                <Grid />
                <Pagination />
                <ActionDialogScreens />
            </div>
        );
        // TODO: check if it should be window.window.innerWidth - (defaultAsideWidth
        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);

        let asideStyles = {minWidth: defaultAsideWidth};
        let dynamicContainerCols = [
            {type: resizibleTypes.ASIDE, id: 'cardInUseLeftAside', width: columnsWidths[0], normalWidth: defaultAsideWidth, minWidth: defaultAsideMinWidth, innerColStyles: {overflowX: 'hidden'}, collapsedWidth: defaultCollapsedWidth, child: leftAside, heading: 'Business Units', styles: asideStyles, info: buildBUText('cards')},
            {type: resizibleTypes.CONTENT, id: 'cardInUseContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
            // {type: resizibleTypes.ASIDE, id: 'cardInUseRightAside', width: columnsWidths[2], normalWidth: defaultAsideWidth, minWidth: defaultAsideMinWidth, innerColStyles: {overflowX: 'hidden'}, collapsePrev: true, collapsedWidth: defaultCollapsedWidth, child: rightAside, heading: 'Card Information', styles: asideStyles, right: true}
        ];

        return dynamicContainerCols;
    }
    render() {
        let dynamicContainerCols = this.getDynamicCols();
        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:cardInUse')} title='Cards in Use' />
                    <Header text={<Text>Cards in Use</Text>} />
                </div>
                <div>
                    <DynamicContainer cols={dynamicContainerCols} />
                </div>
            </div>
        );
    }
};

CardInUse.propTypes = {
    config: PropTypes.object
};

export default connect(
    (state) => {
        return {
            config: state.cardConfig.get('cardsInUse')
        };
    }
)(CardInUse);
