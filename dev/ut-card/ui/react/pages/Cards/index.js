import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import { getLocalStorageStoredColumnWidths, buildBUText } from 'ut-core/ui/react/helpers';

import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import { getLink } from 'ut-front/react/routerHelper';
import Text from 'ut-front-react/components/Text';

import {ToolboxFilters, ToolboxButtons} from '../../containers/Cards/GridToolbox';
import Grid from '../../containers/Cards/Grid';
import FiltersWrapper from './../../containers/Cards/FiltersWrapper';
import FilterByStatus from '../../containers/Cards/Filters/ByStatus';
import FilterByPage from '../../containers/Cards/Filters/ByPage';
import FilterByCustomSearch from '../../containers/Cards/Filters/ByCustomSearch';
import FilterByBusinessUnit from '../../containers/Cards/Filters/ByBusinessUnit';
import FilterByTargetBusinessUnit from '../../containers/Cards/Filters/ByTargetBusinessUnit';
import FilterByIssuingBusinessUnit from '../../containers/Cards/Filters/ByIssuingBusinessUnit';
import FilterByCardProduct from '../../containers/Cards/Filters/ByCardProduct';
import FilterClear from '../../containers/Cards/Filters/Clear';

import CardActionDialogScreens from '../../containers/Cards/ActionDialogScreens';

import ActionButtons from '../../containers/Cards/ActionButtons';

import mainStyle from 'ut-front-react/assets/index.css';
import style from '../style.css';

const defaultAsideWidth = 200;
const defaultAsideMinWidth = 100;
const defaultCollapsedWidth = 30;
let columnsWidths;

class Cards extends Component {
    componentWillMount() {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    render() {
        let leftAside = (
            <div style={{minWidth: defaultAsideMinWidth}}>
                <FilterByBusinessUnit />
            </div>
        );
        let {config} = this.props;
        let filterByCustomSearch = config.getIn(['filters', 'filterByCustomSearch']);
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <FiltersWrapper wrapperClassName={style.filterWrap} >
                            {config.getIn(['filters', 'filterByProduct']) && <div className={style.filterSeparated}> <FilterByCardProduct /> </div>}
                            {config.getIn(['filters', 'filterByTargetBU']) && <div className={style.filterSeparated}> <FilterByTargetBusinessUnit /> </div>}
                            {config.getIn(['filters', 'filterByIssuingBU']) && <div className={style.filterSeparated}> <FilterByIssuingBusinessUnit /> </div>}
                            {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}> <FilterByStatus /> </div>}
                            {config.getIn(['filters', 'filterByCustomSearch']) && <div className={style.filterCustomSearchSeparated}> <FilterByCustomSearch allowedFields={filterByCustomSearch.get('fields')} defaultField={filterByCustomSearch.get('defaultField')} /> </div>}
                            <div><FilterClear /></div>
                        </FiltersWrapper>
                    </ToolboxFilters>
                    <ToolboxButtons>
                        <div className={style.buttonWrap}>
                            <ActionButtons toolbox />
                        </div>
                    </ToolboxButtons>
                </div>
                <Grid />
                <FilterByPage />

                <CardActionDialogScreens />
            </div>
        );

        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);
        let asideStyles = {minWidth: defaultAsideWidth};
        let resizibleContainerCols = [
            {type: resizibleTypes.ASIDE, id: 'cardsLeftAside', width: columnsWidths[0], normalWidth: defaultAsideWidth, minWidth: defaultAsideMinWidth, innerColStyles: {overflowX: 'hidden'}, collapsedWidth: defaultCollapsedWidth, child: leftAside, heading: 'Business Units', info: buildBUText('cards'), styles: asideStyles},
            {type: resizibleTypes.CONTENT, id: 'cardsContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];

        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:cards')} title='Cards in Production' />
                    <Header text={<Text>Cards in Production</Text>} />
                </div>
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} />
                </div>
            </div>
        );
    }
};

Cards.propTypes = {
    config: PropTypes.object
};

export default connect(
    (state) => {
        return {
            config: state.cardConfig.get('cards')
        };
    }
)(Cards);
