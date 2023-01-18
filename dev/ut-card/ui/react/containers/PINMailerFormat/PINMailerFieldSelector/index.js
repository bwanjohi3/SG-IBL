import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
// react components
import Text from 'ut-front-react/components/Text';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Button from 'ut-front-react/components/StandardButton';
// actions
import {
    fieldSelectorSelectionChange,
    setDataField,
    setErrors,
    closeFieldSelector
} from '../PINMailerGrid/actions';
// styles
import style from './style.css';
import cancelStyle from '../../../components/ActionStatusButton/style.css';
import dialogStyles from '../../../components/ActionDialog/style.css';
import {titleStyle, actionsStyle} from '../../../components/ActionDialog/helpers';
import {selectedFieldValidator} from '../PINMailerGrid/helpers';

class PINMailerFieldSelector extends Component {
    constructor(props) {
        super(props);
        this.handleRenderSelectField = this.handleRenderSelectField.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if ((!nextProps.selectedCell.fieldSelectorSelectedValue || (this.props.selectedCell.fieldSelectorSelectedValue !== nextProps.selectedCell.fieldSelectorSelectedValue)) ||
            nextProps.fieldSelectorOpened !== this.props.fieldSelectorOpened ||
            nextProps.errors.get('selectField') !== this.props.errors.get('selectField')) {
            return true;
        }
        return false;
    }
    // dialog actions
    handleSelect() {
        let length;
        let startIndex;
        if (this.props.prevSelectedValueLength !== 0) {
            if (this.props.prevSelectedValueLength > this.props.selectedCell.fieldSelectorSelectedValueLength) {
                startIndex = this.props.selectedCell.colIndex;
                length = 0;
            } else {
                startIndex = this.props.selectedCell.colIndex + this.props.prevSelectedValueLength;
                length = this.props.selectedCell.fieldSelectorSelectedValueLength - this.props.prevSelectedValueLength;
            }
        } else {
            startIndex = this.props.selectedCell.colIndex;
            length = this.props.selectedCell.fieldSelectorSelectedValueLength;
        }
        let validate = selectedFieldValidator(this.props.gridData[this.props.selectedCell.rowIndex], startIndex, length, this.props.gridFieldsCount - 1);
        this.props.setErrors({
            selectField: validate.errorMessage
        });
        if (validate.isValid) {
            this.props.setDataField();
        }
    };
    // FE processing
    handleRenderSelectField() {
        let placeholderText = this.props.allowSelectPlaceholder ? '# CLEAR FIELD' : 'Select field';
        return (<div key='selectField' >
                    <Dropdown
                      label={<span><Text>Select field</Text> *</span>}
                      boldLabel
                      placeholder={<Text>{placeholderText}</Text>}
                      keyProp='name'
                      onSelect={this.props.fieldSelectorSelectionChange}
                      data={this.props.popupData}
                      canSelectPlaceholder={this.props.allowSelectPlaceholder}
                      disabled={false}
                      defaultSelected={this.props.selectedCell.fieldSelectorSelectedValue}
                      isValid={this.props.errors.get('selectField') === undefined}
                      errorMessage={this.props.errors.get('selectField')}
                    />
                </div>);
    }
    render() {
        let actions = [(<div>
                            <Button
                              disabled={!this.props.selectedCell.fieldSelectorSelectedValue}
                              onClick={this.handleSelect}
                              className={cancelStyle.statusActionButton}
                              label='Select'
                            /><div className={style.padRight} />
                            <button onTouchTap={this.props.closeFieldSelector} className={cancelStyle.statusActionButton}><Text>Close</Text></button>
                      </div>)];
        return (
                <Dialog
                  title={'Select print field'}
                  titleStyle={titleStyle}
                  bodyStyle={{padding: '0px', maxHeight: '550px'}}
                  autoDetectWindowHeight={false}
                  actionsContainerStyle={actionsStyle}
                  open={this.props.fieldSelectorOpened}
                  actions={actions}
                  externalMainContentWrapClass={style.contentWrap}
                >
                <div className={dialogStyles.mainContent}>
                    {this.handleRenderSelectField()}
                </div>
                </Dialog>
        );
    }
};

PINMailerFieldSelector.propTypes = {
    // dialog properties
    fieldSelectorOpened: PropTypes.bool.isRequired,
    gridData: PropTypes.array,
    prevSelectedValueLength: PropTypes.number,
    selectedCell: PropTypes.object,
    gridFieldsCount: PropTypes.number,
    errors: PropTypes.object,
    // methods
    fieldSelectorSelectionChange: PropTypes.func,
    setDataField: PropTypes.func,
    setErrors: PropTypes.func,
    closeFieldSelector: PropTypes.func,
    // data
    popupData: PropTypes.array,
    allowSelectPlaceholder: PropTypes.bool
};

export default connect(
    (state) => {
        return {
            // main props
            fieldSelectorOpened: state.pinMailerGrid.get('fieldSelectorOpened'),
            popupData: state.pinMailerGrid.get('data').toJS(),
            gridData: state.pinMailerGrid.get('gridData').toJS(),
            allowSelectPlaceholder: state.pinMailerGrid.get('allowSelectPlaceholder'),
            prevSelectedValueLength: state.pinMailerGrid.get('prevSelectedValueLength'),
            selectedCell: state.pinMailerGrid.get('selectedCell').toJS(),
            gridFieldsCount: state.pinMailerGrid.get('gridFields').toJS().length,
            errors: state.pinMailerGrid.get('errors')
        };
    },
    {
        fieldSelectorSelectionChange,
        setDataField,
        setErrors,
        closeFieldSelector
    }
)(PINMailerFieldSelector);
