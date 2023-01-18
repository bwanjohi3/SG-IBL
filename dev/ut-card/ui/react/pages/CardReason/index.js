import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';

import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import { getLink } from 'ut-front/react/routerHelper';
import Text from 'ut-front-react/components/Text';

import {ToolboxFilters, ToolboxButtons} from '../../containers/CardReason/GridToolbox';
import ActionButtons from '../../containers/CardReason/ActionButtons';
import Grid from '../../containers/CardReason/Grid';
import FilterByModule from '../../containers/CardReason/Filters/ByModule';
import FilterByAction from '../../containers/CardReason/Filters/ByAction';
import FilterByStatus from '../../containers/CardReason/Filters/ByStatus';
import ByReasonName from '../../containers/CardReason/Filters/ByReasonName';
import FilterByPage from '../../containers/CardReason/Filters/ByPage';
import FilterClear from '../../containers/CardReason/Filters/Clear';

import DialogScreens from '../../containers/CardReason/DialogScreens';

import { toggle as toggleCreate } from '../../containers/CardReason/DialogScreens/Create/actions';

import mainStyle from 'ut-front-react/assets/index.css';
import style from '../style.css';

const defaultAsideWidth = 200;
let columnsWidths;

class CardReason extends Component {
    componentWillMount() {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    render() {
        let {config} = this.props;
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <div className={style.filterWrap}>
                            {config.getIn(['filters', 'filterByModule']) && <div className={style.filterSeparated}> <FilterByModule /> </div>}
                            {config.getIn(['filters', 'filterByAction']) && <div className={style.filterSeparated}> <FilterByAction /> </div>}
                            {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}> <FilterByStatus /> </div>}
                            {config.getIn(['filters', 'filterByReasonName']) && <div className={style.filterSeparated}> <ByReasonName /> </div>}
                            <div className={style.clearFilterWrap}><FilterClear /></div>
                        </div>
                    </ToolboxFilters>
                    <ToolboxButtons>
                        <div className={style.buttonWrap}>
                            <ActionButtons />
                        </div>
                    </ToolboxButtons>
                </div>
               <Grid />
               <FilterByPage />

               <DialogScreens />
            </div>
        );

        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);
        let resizibleContainerCols = [
            {type: resizibleTypes.CONTENT, id: 'cardReasonContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];

        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:cardReason')} title='Card Reasons' />
                    <Header
                      text={<Text>Administration - Card Reasons</Text>}
                      buttons={[{text: 'Create Reason', onClick: this.props.toggleCreate, permissions: ['card.reason.add'], styleType: 'primaryLight'}]}
                    />
                </div>
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} />
                </div>
            </div>
        );
    }
};

CardReason.propTypes = {
    config: PropTypes.object,
    toggleCreate: PropTypes.func.isRequired
};

export default connect((state) => ({
    config: state.cardConfig.get('cardReasons')
}),
{ toggleCreate })(CardReason);
