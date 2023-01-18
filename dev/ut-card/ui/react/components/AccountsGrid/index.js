import React, {Component, PropTypes} from 'react';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import {fromJS, Map} from 'immutable';
import style from './style.css';
import Text from 'ut-front-react/components/Text';

export class AccountsGrid extends Component {
    constructor(props) {
        super(props);
        this.simpleDataTransform = this.simpleDataTransform.bind(this);
        this.handleActionField = this.handleActionField.bind(this);
    }
    handleActionField(record, idx) {
        return () => (this.props.handleActionField(record, idx));
    }
    handleWidgetField(record, idx) {
        return () => (this.props.handleWidgetField(record, idx));
    }
    getTransformedFields() {
        let {fields, addLinkedAsColumn, canLinkMoreAccounts} = this.props;
        fields = fromJS(fields);
        if (addLinkedAsColumn) {
            let linkedAsDropdownColumn = Map({name: 'accountLinkText'}); // , style: {textAlign: 'center', width: '20%'}};
            fields = fields.push(linkedAsDropdownColumn);
        }
        if (canLinkMoreAccounts) {
            let linkBtnColumn = Map({name: 'link', style: {textAlign: 'center', width: '20%'}});
            fields = fields.push(linkBtnColumn);
        }
        return fields.toJS();
    }
    getTransformedData() {
        let data;
        if (this.props.widgetNumberingColumn) {
            data = this.widgetNumberDataTransform();
        } else {
            data = this.simpleDataTransform();
        }

        return data;
    }
    simpleDataTransform() {
        if (!this.props.actionFieldText || this.props.actionFieldText === '') {
            return this.props.data;
        }
        return this.props.data.map((el, idx) => {
            el.link = (this.props.actionFieldText &&
                <div className={style.accountAction} onTouchTap={this.handleActionField(el, idx)}>
                    <div className={style[`icon-${this.props.actionFieldText}`]}>&nbsp;</div>
                    <Text>{this.props.actionFieldText}</Text>
                </div>
            );
            return el;
        });
    }
    widgetNumberDataTransform() {
        return fromJS(this.props.data).toJS().map((el, idx) => {
            el.link = (this.props.actionFieldText &&
                <div className={style.accountAction} onTouchTap={this.handleActionField(el, idx)}>
                    <div className={style[`icon-${this.props.actionFieldText}`]}>&nbsp;</div>
                    <Text>{this.props.actionFieldText}</Text>
                </div>
            );
            let className = [style.widgetNumWidget];
            if (this.props.widgetNumberingActionColumn && el[this.props.widgetNumberingActionColumn]) {
                className.push(style.booked);
            }
            el[this.props.widgetNumberingColumn] = (
                <div className={style.widgetNum}>
                    <span className={className.join(' ')} onTouchTap={this.handleWidgetField(el, idx)}>&nbsp;</span>
                    <span className={style.widgetNumNum}>{idx + 1}</span>
                    <span className={style.widgetNumValue}>{el[this.props.widgetNumberingColumn]}</span>
                </div>
            );
            return el;
        });
    }
    render() {
        let fields = this.getTransformedFields();
        let data = this.getTransformedData();
        return (
            <SimpleGrid
              hideHeader
              mainClassName='dataGridTableCustomFields'
              externalStyle={style}
              fields={fields}
              data={data}
            />
        );
    }
};

AccountsGrid.propTypes = {
    actionFieldText: PropTypes.string,
    widgetNumberingColumn: PropTypes.string,
    widgetNumberingActionColumn: PropTypes.string,
    handleActionField: PropTypes.func,
    handleWidgetField: PropTypes.func,
    fields: PropTypes.array,
    data: PropTypes.array,
    addLinkedAsColumn: PropTypes.bool.isRequired,
    canLinkMoreAccounts: PropTypes.bool.isRequired
};

AccountsGrid.defaultProps = {
    data: [],
    addLinkedAsColumn: false,
    canLinkMoreAccounts: true
};
