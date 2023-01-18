import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import {AccountsGrid} from '../';
import Accordion from '../../Accordion';
import ActionDialog from './../../ActionDialog';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import style from './style.css';
import Text from 'ut-front-react/components/Text';
import buttonStyles from './../../ActionStatusButton/style.css';

export class AccountsGridSummary extends Component {
    static getInitialState() {
        return {
            isOpen: false,
            data: {}, // storing record and idx
            linkedAs: {
                id: '',
                text: ''
            },
            isValid: undefined
        };
    }
    constructor(props) {
        super(props);
        this.handleLink = this.handleLink.bind(this);
        this.handleUnLink = this.handleUnLink.bind(this);
        this.handleWidgetField = this.handleWidgetField.bind(this);
        this.changeLinkedAs = this.changeLinkedAs.bind(this);
        this.confirmLinkAccount = this.confirmLinkAccount.bind(this);
        this.closeLinkConfirmation = this.closeLinkConfirmation.bind(this);
        this.state = AccountsGridSummary.getInitialState();
    }
    handleLink(record, idx) {
        if (this.shouldShowLinkedAs() && !this.state.isOpen) {
            this.openConfirmDialog(record, idx);
        } else {
            this.props.link(this.props.cardId, record.accountId, record.feId, record);
            this.closeLinkConfirmation();
        }
    }
    shouldShowLinkedAs() {
        return this.props.linkedAs.length > 0;
    }
    openConfirmDialog(record, idx) {
        this.setState({
            data: {
                record,
                idx
            },
            isOpen: true
        });
    }
    handleUnLink(record, idx) {
        if (this.props.readOnly) {
            return;
        }
        this.props.unLink(this.props.cardId, record.accountId, record.feId);
    }
    handleWidgetField(record) {
        if (this.props.readOnly) {
            return;
        }
        this.props.setDefault(this.props.cardId, record.accountId, record.feId, record.currency);
    }
    getStyle(name) {
        return this.props.externalStyle[name] || this.context.implementationStyle[name] || style[name];
    }
    changeLinkedAs(data) {
        let selected = this.props.linkedAs.find((link) => {
            return link.key === data.value;
        });
        this.setState({
            isValid: true,
            linkedAs: {
                id: selected.key,
                text: selected.name
            }
        });
    }
    confirmLinkAccount() {
        if (this.checkIfLinkedAsIsValid()) {
            let record = this.state.data.record;
            if (this.shouldShowLinkedAs()) {
                record.accountLinkText = this.state.linkedAs.text;
                record.accountLinkId = this.state.linkedAs.id;
            }

            this.handleLink(record, this.state.data.idx);
        } else {
            this.setState({
                isValid: false
            });
        }
    }
    checkIfLinkedAsIsValid() {
        if (this.state.isValid) {
            return true;
        } else {
            return false;
        }
    }
    closeLinkConfirmation() {
        this.setState(AccountsGridSummary.getInitialState());
    }
    getActions() {
        const actions = [
            <button onTouchTap={this.confirmLinkAccount} className={classnames(buttonStyles.statusActionButton, buttonStyles.highlighted, style.buttonsRightMargin)}><Text>Link</Text></button>,
            <button onTouchTap={this.closeLinkConfirmation} className={buttonStyles.statusActionButton}><Text>Close</Text></button>
        ];

        return actions;
    }
    render() {
        let {hasAccountsError, hasLinkedAccountsError, hasPrimaryAccountError, canLinkMoreAccounts} = this.props;
        let shouldShowMissingAccountsError = hasAccountsError || (this.props.data.linked.length === 0 && this.props.data.unlinked.length === 0);
        let addLinkedAsColumnWhenUnlinked = this.shouldShowLinkedAs() && false;
        let addLinkedAsColumnWhenLinked = this.shouldShowLinkedAs() && true;
        let actions = this.getActions();
        return (
            <div>
                {this.props.fetched && <div>
                    {!this.props.readOnly && <div className={classnames({[style.topMargin]: this.props.withTopMargin})}>
                        <Accordion title={<Text>Available Accounts</Text>}>
                            {shouldShowMissingAccountsError && <div className={style.errorWrap}> <div className={style.errorMessage}>No accounts available</div></div>}
                            {hasLinkedAccountsError && <div className={style.errorWrap}> <div className={classnames(style.infoMessage, {[style.errorMessage]: hasLinkedAccountsError})}>Please link an account.</div></div>}
                            {(this.props.data.unlinked.length > 0) && <div>
                                <AccountsGrid
                                  actionFieldText='Link'
                                  handleActionField={this.handleLink}
                                  fields={this.props.availableAccountsFields}
                                  addLinkedAsColumn={addLinkedAsColumnWhenUnlinked}
                                  canLinkMoreAccounts={canLinkMoreAccounts}
                                  data={this.props.data.unlinked}
                                />
                            </div>}
                        </Accordion>
                    </div>}
                    <div className={classnames({[style.topMargin]: this.props.withTopMargin})}>
                        <Accordion title={<Text>Linked Accounts</Text>}>
                            <div className={this.getStyle('gridDefsWidget')}>
                                {!this.props.readOnly && <div className={style.errorWrap}> <div className={classnames(style.infoMessage, {[style.errorMessage]: hasPrimaryAccountError})}>Please link an account and select a star to make the account primary. Only one account can be primary.</div></div>}
                                {(this.props.data.linked.length > 0) && <AccountsGrid
                                  handleActionField={this.handleUnLink}
                                  handleWidgetField={this.handleWidgetField}
                                  widgetNumberingColumn={this.props.widgetNumberingColumn}
                                  widgetNumberingActionColumn='isPrimary'
                                  addLinkedAsColumn={addLinkedAsColumnWhenLinked}
                                  actionFieldText={this.props.readOnly ? '' : 'Remove'}
                                  fields={this.props.linkedAccountsFields}
                                  canLinkMoreAccounts
                                  data={this.props.data.linked}
                                />}
                            </div>
                        </Accordion>
                    </div>
                    <div>
                        {this.state.isOpen && <ActionDialog open={this.state.isOpen} title={'Link Account'} actions={actions} onClose={this.closeLinkConfirmation}>
                            <Dropdown
                              defaultSelected={this.state.linkedAs.id}
                              label={<span><Text>Link As</Text> *</span>}
                              boldLabel
                              placeholder={<Text>Link As</Text>}
                              keyProp='linkedAsId'
                              onSelect={this.changeLinkedAs}
                              data={this.props.linkedAs}
                              isValid={this.state.isValid}
                              errorMessage={'"Link As" can not be empty'}
                            />
                        </ActionDialog>}
                    </div>
                </div>}
            </div>
        );
    }
};

AccountsGridSummary.propTypes = {
    withTopMargin: PropTypes.bool,
    externalStyle: PropTypes.object,
    setDefault: PropTypes.func,
    link: PropTypes.func,
    unLink: PropTypes.func,
    data: PropTypes.object,
    linkedAs: PropTypes.array, // used to show popup when linking an account. if procedures return results for this - popup when linking should be shown
    cardId: PropTypes.number,
    changeId: PropTypes.number,
    availableAccountsFields: PropTypes.array.isRequired,
    linkedAccountsFields: PropTypes.array.isRequired,
    widgetNumberingColumn: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    fetched: PropTypes.bool.isRequired,
    hasAccountsError: PropTypes.bool.isRequired,
    hasLinkedAccountsError: PropTypes.bool.isRequired,
    hasPrimaryAccountError: PropTypes.bool.isRequired,
    canLinkMoreAccounts: PropTypes.bool.isRequired
};

AccountsGridSummary.defaultProps = {
    externalStyle: {},
    linkedAs: [],
    availableAccountsFields: [{name: 'accountTypeId', title: 'Available Accounts', style: {width: '45%'}}, {name: 'accountNumber', style: {width: '45%'}}],
    linkedAccountsFields: [{name: 'accountTypeId', title: 'Linked Accounts', style: {width: '45%'}}, {name: 'accountNumber', style: {width: '45%'}}],
    widgetNumberingColumn: 'accountTypeId',
    setDefault: (cardId, accountId, id, currency) => {},
    link: (cardId, accountId) => {},
    unLink: (cardId, accountId) => {},
    readOnly: false,
    fetched: true,
    hasAccountsError: false,
    hasLinkedAccountsError: false,
    hasPrimaryAccountError: false
};

AccountsGridSummary.contextTypes = {
    implementationStyle: PropTypes.object
};
