import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';

import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import { getLink } from 'ut-front/react/routerHelper';
import Text from 'ut-front-react/components/Text';

import {ToolboxFilters, ToolboxButtons} from '../../containers/CardBin/GridToolbox';
import FilterByStatus from './../../containers/CardBin/Filters/ByStatus';
import FilterClear from './../../containers/CardBin/Filters/Clear';
import GridToolboxButtons from './../../containers/CardBin/GridToolboxButtons';
import Grid from '../../containers/CardBin/Grid';
import Pagination from './../../containers/CardBin/Pagination';

import Create from '../../containers/CardBin/Popups/Create';
import BinDetails from '../../containers/CardBin/Popups/Details';

import { openCreateBinDialog } from '../../containers/CardBin/Popups/Create/actions';

import mainStyle from 'ut-front-react/assets/index.css';
import style from '../style.css';

const defaultAsideWidth = 200;
let columnsWidths;

class CardBin extends Component {
    componentWillMount() {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    getButtons() {
        let buttons = [];
        if (this.context.checkPermission('card.bin.add')) {
            buttons.push({text: 'Create BIN', onClick: this.props.openCreateBinDialog, styleType: 'primaryLight'});
        }

        return buttons;
    }
    render() {
        let {config} = this.props;
        let content = (
            <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <div className={mainStyle.actionBarWrap}>
                    <ToolboxFilters>
                        <div className={style.filterWrap}>
                            {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}> <FilterByStatus /> </div>}
                            <div className={style.clearFilterWrap}><FilterClear /></div>
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

               <Create />
               <BinDetails />
            </div>
        );

        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);
        let resizibleContainerCols = [
            {type: resizibleTypes.CONTENT, id: 'cardBinContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];
        let buttons = this.getButtons();
        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:cardBin')} title='Card BINs' />
                    <Header
                      text={<Text>Administration - Card BINs</Text>}
                      buttons={buttons}
                    />
                </div>
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} />
                </div>
            </div>
        );
    }
};

CardBin.propTypes = {
    config: PropTypes.object,
    openCreateBinDialog: PropTypes.func.isRequired
};

CardBin.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect((state) => {
    return {
        config: state.cardConfig.get('cardBins')
    };
},
{ openCreateBinDialog })(CardBin);
