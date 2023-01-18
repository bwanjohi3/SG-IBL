import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import ActionStatusButtonsGroup from '../../../components/ActionStatusButtonsGroup';
import ActionStatusLink from '../../../components/ActionStatusLink';
import BatchDownloadInfo from '../BatchDownloadInfo';

import {open as handleDetailsOpen} from '../Details/actions';
import Text from 'ut-front-react/components/Text';
import {toggleStatusUpdatePrompt} from '../Details/BatchStatusUpdate/actions';
import {downloadFile} from '../Grid/actions';
import {checkDownload} from '../BatchDownloadInfo/actions';
import style from '../../../components/ActionStatusButton/style.css';

const actionsToExclude = ['Approve', 'Reject', 'Update', 'Decline', 'GeneratePIN', 'Complete'];

export class Buttons extends Component {
    constructor(props) {
        super(props);
        this.mapActionLabelToId = this.mapActionLabelToId.bind(this);
        this.handleDetailsToggle = this.handleDetailsToggle.bind(this);
        this.batchDownload = this.batchDownload.bind(this);
    }
    handleDetailsToggle() {
        if (this.props.checkedBatches.size === 1) {
            this.props.handleDetailsOpen(this.props.checkedBatches.toList().toJS()[0].id);
        }
    }
    mapActionLabelToId(label) {
        var result;
        this.props.actionList.forEach(function(value) {
            if (value.label === label) {
                result = value.id;
            }
        });
        return result;
    }
    batchDownload() {
        if (this.props.checkedBatches.size === 1) {
            let checkedIdx = parseInt(this.props.checkedBatches.keySeq().first());
            let batchId = this.props.checkedBatches.first().get('id');
            if (!this.props.checkedBatches.first().get('areAllCardsGenerated')) {
                this.props.checkDownload(batchId, checkedIdx);
            } else {
                this.props.downloadFile(checkedIdx);
            }
        }
    }
    render() {
        let currentStatuses = this.props.checkedBatches.toList().toJS().reduce((prev, cur) => {
            if (!~prev.indexOf(cur.statusId)) {
                prev.push(cur.statusId);
            }
            return prev;
        }, []);
        let disabled = (this.props.checkedBatches.size !== 1) ? 'disabled' : '';
        let nestComponents = {
            'Download': (key, currentStatuses, item, lastItem) => {
                // lastItem should never be true, because there is always Close button to the right
                // padRight={!lastItem}
                return (
                    <ActionStatusLink
                      padRight
                      currentStatuses={currentStatuses}
                      action={item}
                      page='batch'
                      key={key}
                      href={this.props.actionStatusLinkHref}
                      handleClick={this.batchDownload}
                      isDisabled={this.props.checkedBatches.size !== 1}>
                      {item.label}
                    </ActionStatusLink>
                );
            }
        };

        let excludeButtons = (this.props.checkedBatches.size !== 1) ? ['SentToProduction'] : [];
        return (
            <div>
              {this.context.checkPermission('card.batch.get') &&
                   <button style={{margin: '0 5px 0 0'}} className={disabled ? style.statusActionButtonDisabled : style.statusActionButton} disabled={disabled} onTouchTap={!disabled ? this.handleDetailsToggle : () => {}}>
                        <Text>Details</Text>
                </button>}
               <ActionStatusButtonsGroup page='batch' statusIds={currentStatuses} excludeActions={actionsToExclude} disabled={excludeButtons} nestComponents={nestComponents} handleClick={this.props.toggleStatusUpdatePrompt} />
               <BatchDownloadInfo
                 open={this.props.confirmationDialogOpened}
                 download={this.props.downloadFlag}
                 confirmationMessage={this.props.confirmationMessage}
                 batchId={this.props.checkedBatches.size === 1 ? this.props.checkedBatches.first().get('id') : undefined}
               />
            </div>
        );
    }
}

Buttons.propTypes = {
    toggleStatusUpdatePrompt: PropTypes.func,
    handleDetailsOpen: PropTypes.func,
    downloadFile: PropTypes.func,
    checkDownload: PropTypes.func,
    actionList: PropTypes.array,
    actionStatusLinkHref: PropTypes.string,
    confirmationDialogOpened: PropTypes.bool,
    downloadFlag: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    checkedBatches: PropTypes.object
    // batchData: PropTypes.object
};

Buttons.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            checkedBatches: state.batchesGrid.get('checkedBatchItems') || [],
            // batchData: state.batchesGrid.get('data'),
            actionList: state.utCardStatusAction.get('actions-batch') || [],
            actionStatusLinkHref: state.batchDownloadInfo.get('actionStatusLinkHref'),
            confirmationDialogOpened: state.batchDownloadInfo.get('confirmationDialogOpened'),
            downloadFlag: state.batchDownloadInfo.get('downloadFile'),
            confirmationMessage: state.batchDownloadInfo.get('confirmationMessage')
        };
    },
    {toggleStatusUpdatePrompt, handleDetailsOpen, downloadFile, checkDownload}
)(Buttons);
