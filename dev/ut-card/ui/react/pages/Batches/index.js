import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import mainStyle from 'ut-front-react/assets/index.css';
import { getLink } from 'ut-front/react/routerHelper';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';

import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';
import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';

import {ToolboxFilters, ToolboxButtons} from '../../containers/Batches/GridToolbox';
import FilterByStatus from '../../containers/Batches/Filters/ByStatus';
import FilterByBatchName from '../../containers/Batches/Filters/ByBatchName';
import FilterByTargetUnit from '../../containers/Batches/Filters/ByTargetBusinessUnit';
import FilterByIssuingUnit from '../../containers/Batches/Filters/ByIssuingBusinessUnit';
import FilterByProduct from '../../containers/Batches/Filters/ByProduct';
import BatchDetails from '../../containers/Batches/Details';
import SuccessDialog from '../../containers/Batches/SuccessDialog';
import BatchesPagination from '../../containers/Batches/Pagination';
import BatchesGrid from '../../containers/Batches/Grid';
import Buttons from '../../containers/Batches/Buttons';
import NoNameBatch from '../../containers/Batches/NoNameBatch';
import BatchStatusUpdate from '../../containers/Batches/Details/BatchStatusUpdate';
import ClearFilters from '../../containers/Batches/Filters/Clear';
import {open as openNoNameBatch} from '../../containers/Batches/NoNameBatch/actions';
import style from '../style.css';

const defaultAsideWidth = 200;
let columnsWidths;

class Batches extends Component {
    constructor(props) {
        super(props);
        this.openNoNameBatch = this.openNoNameBatch.bind(this);
    }
    componentWillMount() {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    openNoNameBatch() {
        this.props.openNoNameBatch();
    }
    getButtons() {
        let buttons = [];
        if (this.context.checkPermission('card.batch.addNoNameBatch') && (this.props.usedCardTypes === 'noNamed' || this.props.usedCardTypes === 'both')) {
            buttons.push({text: 'Create No Name Batch', onClick: this.openNoNameBatch, styleType: 'primaryLight'});
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
                                {config.getIn(['filters', 'filterByTargetBU']) && <div className={style.filterSeparated}><FilterByTargetUnit /></div>}
                                {config.getIn(['filters', 'filterByIssuingBU']) && <div className={style.filterSeparated}><FilterByIssuingUnit /></div>}
                                {config.getIn(['filters', 'filterByProduct']) && <div className={style.filterSeparated}><FilterByProduct /></div>}
                                {config.getIn(['filters', 'filterByStatus']) && <div className={style.filterSeparated}><FilterByStatus /></div>}
                                {config.getIn(['filters', 'filterByBatchName']) && <div className={style.filterSeparated}><FilterByBatchName /></div>}
                                <div><ClearFilters /></div>
                            </div>
                        </ToolboxFilters>
                        <ToolboxButtons>
                            <div className={style.buttonWrap}>
                                <Buttons />
                                <BatchStatusUpdate />
                            </div>
                        </ToolboxButtons>
                    </div>
                    <div>
                        <BatchesGrid />
                    </div>
                    <div style={{padding: '20px 10px 0 10px'}}>
                        <div >
                            <NoNameBatch />
                        </div>
                    </div>
                    <div style={{padding: '20px 10px 0 10px'}}>
                        <div >
                            <BatchDetails />
                        </div>
                    </div >
                    <div style={{padding: '10px 0 0 0'}}>
                        <BatchesPagination />
                    </div>
                    <SuccessDialog />
                </div>
        );

        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);
        let resizibleContainerCols = [
            {type: resizibleTypes.CONTENT, id: 'batchesContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];
        let buttons = this.getButtons();
        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:batch')} title='Batches' />
                    <Header text={'Batches'} buttons={buttons} />
                </div>
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} />
                </div>
            </div>
        );
    }
};

Batches.propTypes = {
    config: PropTypes.object,
    usedCardTypes: PropTypes.string,
    openNoNameBatch: PropTypes.func
};

Batches.contextTypes = {
    checkPermission: PropTypes.func
};

export default connect(
    (state) => {
        return {
            config: state.cardConfig.get('batches'),
            usedCardTypes: state.cardConfig.get('usedCardTypes')
        };
    },
    {openNoNameBatch}
)(Batches);
