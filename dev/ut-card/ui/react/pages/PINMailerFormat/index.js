import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { getLink } from 'ut-front/react/routerHelper';
import Header from 'ut-front-react/components/PageLayout/Header';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import { getLocalStorageStoredColumnWidths } from 'ut-core/ui/react/helpers';
import ResizibleContainer from 'ut-front-react/components/ResiziblePageLayout/Container';
import resizibleTypes from 'ut-front-react/components/ResiziblePageLayout/resizibleTypes';

import PINMailerGrid from '../../containers/PINMailerFormat/PINMailerGrid/';
import ConfirmationDialog from '../../containers/PINMailerFormat/ConfirmationDialog';

import {
    fetch,
    save,
    openConfirmationDialog,
    closeConfirmationDialog
} from '../../containers/PINMailerFormat/PINMailerGrid/actions';
// import style from '../style.css';

const defaultAsideWidth = 200;
let columnsWidths;

class PINMailerFormat extends Component {
    constructor(props) {
        super(props);
        this.savePinMailerFormat = this.savePinMailerFormat.bind(this);
        this.loadPinMailerFormat = this.loadPinMailerFormat.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
    }
    componentWillMount() {
        columnsWidths = getLocalStorageStoredColumnWidths();
    }
    savePinMailerFormat() {
        this.props.openConfirmationDialog({
            confirmationDialogTitle: 'Save confirmation',
            confirmationDialogMessage: 'Are you sure you want to save the current PIN mailer format ?',
            confirmationDialogActionName: 'Save'
        });
    }
    loadPinMailerFormat() {
        this.props.openConfirmationDialog({
            confirmationDialogTitle: 'Reset confirmation',
            confirmationDialogMessage: 'Are you sure you want to reset to the last saved PIN mailer format ?',
            confirmationDialogActionName: 'Reset'
        });
    }
    onCancel() {
        this.props.closeConfirmationDialog();
    }
    onConfirm() {
        switch (this.props.confirmationDialogActionName) {
            case 'Save':
                this.props.save([
                    {key: 'pinMailerFormatString', value: this.props.printFormatString},
                    {key: 'pinMailerWidth', value: this.props.mailerProperties.get('pinMailerWidth')},
                    {key: 'pinMailerHeight', value: this.props.mailerProperties.get('pinMailerHeight')},
                    {key: 'pinMailerMaxFieldIndex', value: this.props.pinMailerMaxFieldIndex}
                ]);
                this.props.closeConfirmationDialog();
                break;
            case 'Reset':
                this.props.fetch([
                    {key: 'pinMailerFormatString'},
                    {key: 'pinMailerWidth'},
                    {key: 'pinMailerHeight'},
                    {key: 'pinMailerMaxFieldIndex'}
                ]);
                this.props.closeConfirmationDialog();
                break;
            default:
                break;
        }
    }
    render() {
        let content =
            <PINMailerGrid />;
        let contentNormalWidth = window.window.innerWidth - (defaultAsideWidth + defaultAsideWidth);
        let resizibleContainerCols = [
            {type: resizibleTypes.CONTENT, id: 'pinMailerContent', width: columnsWidths[1], normalWidth: contentNormalWidth, minWidth: 250, child: content}
        ];
        let buttons = [
            {text: 'Save', onClick: this.savePinMailerFormat},
            {text: 'Reset', onClick: this.loadPinMailerFormat}
        ];
        return (
            <div>
                <div>
                    <AddTab pathname={getLink('ut-card:pinMailerFormat')} title='PIN Mailer Format' />
                    <Header text={'PIN Mailer Format'} buttons={buttons} />
                </div>
                <div>
                    <ResizibleContainer cols={resizibleContainerCols} />
                </div>
                <ConfirmationDialog
                  open={this.props.confirmationDialogOpened}
                  title={this.props.confirmationDialogTitle}
                  confirmationMessage={this.props.confirmationDialogMessage}
                  actionName={this.props.confirmationDialogActionName}
                  onSuccess={this.onConfirm}
                  onCancel={this.onCancel} />
                </div>
        );
    }
};

PINMailerFormat.propTypes = {
    confirmationDialogOpened: PropTypes.bool,
    confirmationDialogTitle: PropTypes.string,
    confirmationDialogMessage: PropTypes.string,
    confirmationDialogActionName: PropTypes.string,
    printFormatString: PropTypes.string,
    pinMailerMaxFieldIndex: PropTypes.string,
    mailerProperties: PropTypes.object,
    fetch: PropTypes.func,
    save: PropTypes.func,
    openConfirmationDialog: PropTypes.func,
    closeConfirmationDialog: PropTypes.func
};

PINMailerFormat.contextTypes = {
};

export default connect(
    (state) => {
        return {
            confirmationDialogOpened: state.pinMailerGrid.get('confirmationDialogOpened'),
            confirmationDialogTitle: state.pinMailerGrid.get('confirmationDialogTitle'),
            confirmationDialogMessage: state.pinMailerGrid.get('confirmationDialogMessage'),
            confirmationDialogActionName: state.pinMailerGrid.get('confirmationDialogActionName'),
            printFormatString: state.pinMailerGrid.get('printFormatString'),
            pinMailerMaxFieldIndex: state.pinMailerGrid.get('pinMailerMaxFieldIndex'),
            mailerProperties: state.pinMailerGrid.get('mailerProperties')
        };
    },
    {fetch, save, openConfirmationDialog, closeConfirmationDialog}
)(PINMailerFormat);
