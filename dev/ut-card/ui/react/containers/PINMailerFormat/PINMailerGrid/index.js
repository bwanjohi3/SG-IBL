import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import Input from 'ut-front-react/components/Input';
import Checkbox from 'ut-front-react/components/Input/Checkbox';
// import NumericInput from 'react-numeric-input';
import { Container, Row, Col } from 'reactstrap';
// card components
import PINMailerFieldSelector from '../PINMailerFieldSelector';
import {
    fetch,
    openFieldSelector,
    handleContinuousPaperClick,
    setContinuousPaperValue,
    setPrintFormatString,
    setPrintFormatStringFromDb,
    setVerticalData,
    setGridFields,
    setGridData,
    setSelectedData,

    setMailerWidth,
    setMailerHeight,
    setErrors
} from './actions';
import Text from 'ut-front-react/components/Text';
import style from './style.css';
import printFormatStyle from './printFormatStyle.css';
import {mailerSizeValidator} from './helpers';

const mailerSizeStep = {
    width: 0.1,
    height: 0.5
};
const colsPerInch = 10;
const rowsPerInch = 6;
// td width = 20px && td height = 31px approximately fits the real W:H ratio

export class PINMailerGrid extends Component {
    constructor(props) {
        super(props);
        this.formatMailerSize = this.formatMailerSize.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.addSelectionToGridData = this.addSelectionToGridData.bind(this);
        this.constructPrintFormatString = this.constructPrintFormatString.bind(this);
        this.handleChangeMailerWidth = this.handleChangeMailerWidth.bind(this);
        this.handleChangeMailerHeight = this.handleChangeMailerHeight.bind(this);
        this.constructSpanFields = this.constructSpanFields.bind(this);
    }
    componentWillMount() {
        this.props.fetch([
            {key: 'pinMailerFormatString'},
            {key: 'pinMailerWidth'},
            {key: 'pinMailerHeight'},
            {key: 'pinMailerMaxFieldIndex'}
        ]);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.changeId !== nextProps.changeId &&
            nextProps.selectedCell.fieldSelectorSelectedValue) {
            // there is selection in the field selector
            if (nextProps.selectedCell.fieldSelectorSelectedValue === '__placeholder__') {
                // selection is CLEAR FIELD
                let {gridData, selectedData} = this.removeSelectionFromGridData(nextProps.selectedCell, nextProps.gridData, nextProps.selectedData);
                this.props.setSelectedData(selectedData);
                this.props.setGridData(gridData);
            } else {
                // selection is a field
                let selectedData = nextProps.selectedData;
                let gridData = this.addSelectionToGridData(nextProps.gridData, nextProps.selectedCell, nextProps.prevSelectedValueLength);
                if (nextProps.prevSelectedValueLength > 0) {
                    // there was previously selected field in the same position of the grid
                    selectedData = this.removeFieldFromSelectedData(nextProps.selectedData, nextProps.selectedCell);
                }
                selectedData.push(nextProps.selectedCell);
                this.props.setSelectedData(selectedData);
                this.props.setGridData(gridData, this.formatMailerSize(nextProps.mailerProperties.pinMailerHeight));
                this.props.setPrintFormatString(this.constructPrintFormatString(gridData, selectedData, nextProps.continuousPaper));
            }
        } else if (this.props.changeId !== nextProps.changeId &&
            nextProps.printFormatString !== this.props.printFormatString &&
            nextProps.printFormatStringFromDb) {
            // there is change in the printFormatString and it comes after DB fetch
            let data = [];
            let mailerProperties = nextProps.mailerProperties;
            if (nextProps.printFormatString && nextProps.printFormatString.length > 0) {
                // there is new value of the printFormatString
                data = this.loadFormatStringData(nextProps.printFormatString, nextProps.mailerProperties.pinMailerHeight);
                this.props.setVerticalData({
                    verticalFields: this.constructVerticalFields(nextProps.mailerProperties.pinMailerHeight),
                    verticalSpanFields: this.constructSpanFields(nextProps.mailerProperties.pinMailerHeight, rowsPerInch)
                });
                this.props.setGridFields(this.constructGridFields(mailerProperties.pinMailerWidth), this.constructSpanFields(mailerProperties.pinMailerWidth, colsPerInch), this.formatMailerSize(mailerProperties.pinMailerWidth));
                this.props.setSelectedData(data.selectedData);
                this.props.setGridData(data.gridData, this.formatMailerSize(mailerProperties.pinMailerHeight));
                this.props.setContinuousPaperValue(data.continuousPaper);
            } else {
                // there is NOT new value (null, undefined) of the printFormatString (not set in the DB for example)
                data = this.constructGridData(mailerProperties.pinMailerHeight);
                this.props.setGridFields(this.constructGridFields(mailerProperties.pinMailerWidth), this.constructSpanFields(mailerProperties.pinMailerWidth, colsPerInch), this.formatMailerSize(mailerProperties.pinMailerWidth));
                this.props.setGridData(data, this.formatMailerSize(mailerProperties.pinMailerHeight));
                this.props.setPrintFormatString(this.constructPrintFormatString(data, undefined, nextProps.continuousPaper));
            }
        } else if (this.props.selectedData.length !== nextProps.selectedData.length ||
            this.props.continuousPaper !== nextProps.continuousPaper ||
            this.props.mailerProperties.pinMailerHeight !== nextProps.mailerProperties.pinMailerHeight ||
            this.props.gridData.length !== nextProps.gridData.length) {
            // there is change of some of the data above
            if (!nextProps.printFormatStringFromDb) {
                // change does NOT come from DB
                this.props.setPrintFormatString(this.constructPrintFormatString(nextProps.gridData, nextProps.selectedData, nextProps.continuousPaper));
            } else {
                // change comes from DB, set the property to false to prevent infinite recursion
                this.props.setPrintFormatStringFromDb(false);
            }
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.changeId !== nextProps.changeId) {
            return true;
        }
        return false;
    }

    mapArrayKeyToName(dataArray, key) {
        let result = dataArray.filter((element) => {
            return element.key === key.toString();
        }).pop();
        return (result && result.name) || '';
    }
    loadFormatStringData(printFormatString, pinMailerHeight) {
        let rowIndex = 0;
        let continuousPaper = true;
        let gridData = this.constructGridData(pinMailerHeight);
        let selectedData = [];
        let stringFields = printFormatString.split('>');
        stringFields.forEach((stringField) => {
            if (stringField.length > 0) {
                switch (stringField) {
                    // new line
                    case 'L':
                        rowIndex++;
                        break;
                    // form feed
                    case 'F':
                        continuousPaper = false;
                        break;
                    // print field
                    default:
                        let splitString = '';
                        // TODO: check if regex can be replaced with something better
                        if (/^\d{3}\^{1}(\d{1}|\w{1})$/.test(stringField)) {
                            // single character field number
                            splitString = '^';
                        } else if (/^\d{3}\^{2}(1[0-9A-F])$/.test(stringField)) {
                            // double character field number
                            splitString = '^^';
                        } else {
                            // TODO: else what ???
                        }

                        if (splitString.length > 0) {
                            let fieldData = stringField.split(splitString);
                            let fieldSelectorSelectedValueLength = this.mapArrayKeyToName(this.props.data, fieldData[1]).length + 1;
                            let selectedCell = {
                                rowIndex: rowIndex - 1,
                                colIndex: parseInt(fieldData[0]) + 1,
                                fieldSelectorSelectedValue: fieldData[1],
                                fieldSelectorSelectedValueLength: fieldSelectorSelectedValueLength
                            };
                            selectedData.push(selectedCell);
                            gridData = this.addSelectionToGridData(gridData, selectedCell, 0);
                        }
                        break;
                }
            }
        });
        return {
            gridData: gridData,
            selectedData: selectedData,
            continuousPaper: continuousPaper
        };
    }
    formatMailerSize(value) {
        let result = value.split('.');
        if (['', undefined].includes(result[1])) {
            result[1] = '0';
        }
        return result.join('.');
    }
    constructGridFields(pinMailerWidth) {
        let result = [];
        let count = parseInt(pinMailerWidth * colsPerInch);
        let i = 0;
        result.push({
            title: '',
            name: i.toString(),
            visible: false
        });
        i++;
        do {
            result.push({
                title: i.toString(),
                name: i.toString()
            });
            i++;
        } while (i <= count);
        return result;
    }
    constructSpanFields(inchSize, inchCount) {
        let result = [];
        let count = parseInt(inchSize * inchCount);
        let children = [];
        let spanFieldIndex = 1;
        for (let i = 1; i <= count; i++) {
            children.push(i.toString());
            if (i % inchCount === 0 || i === count) {
                let title = '...';
                if (children.length > (inchCount / 3)) {
                    title = spanFieldIndex > 1 ? spanFieldIndex.toString() + ' inches' : '1 inch';
                }
                result.push({
                    title: title,
                    children: children
                });
                children = [];
                spanFieldIndex++;
            }
        }
        return result;
    }
    constructGridData(pinMailerHeight, currentGridData) {
        let count = parseInt(pinMailerHeight * rowsPerInch);
        let result = [];
        for (let i = 0; i < count; i++) {
            result.push((currentGridData && currentGridData[i]));
        }
        return result;
    }
    constructVerticalFields(pinMailerHeight) {
        let fieldsCount = pinMailerHeight * rowsPerInch;
        let result = [];
        for (let i = 0; i < fieldsCount; i++) {
            result.push({
                name: (i + 1).toString(),
                title: (i + 1).toString()
            });
        }
        return result;
    }
    constructPrintFormatString(gridData, selectedData, continuousPaper) {
        let printFormatString = '>';
        let pinMailerMaxFieldIndex = '0';
        gridData.forEach((gridDataValue, rowIndex) => {
            printFormatString += 'L>';
            if (selectedData) {
                let dataCells = selectedData.filter((selectedDataValue) => {
                    return selectedDataValue.rowIndex === rowIndex;
                });
                if (dataCells.length > 0) {
                    dataCells.sort((a, b) => (a.colIndex - b.colIndex));
                    dataCells.forEach((dataCellValue) => {
                        let printField = '';
                        printField = ('00' + (dataCellValue.colIndex - 1).toString()).slice(-3) + '^'.repeat(dataCellValue.fieldSelectorSelectedValue.length) + dataCellValue.fieldSelectorSelectedValue + '>';
                        if (!isNaN(dataCellValue.fieldSelectorSelectedValue)) {
                            pinMailerMaxFieldIndex = Math.max(dataCellValue.fieldSelectorSelectedValue, pinMailerMaxFieldIndex).toString();
                        }
                        printFormatString += printField;
                    });
                }
            }
        });
        if (!continuousPaper) {
            printFormatString += 'F>';
        }
        return {
            printFormatString: printFormatString,
            pinMailerMaxFieldIndex: pinMailerMaxFieldIndex
        };
    }
    addSelectionToGridData(gridData, selectedCell, prevSelectedValueLength) {
        let rowIndex = selectedCell.rowIndex;
        let colIndex = parseInt(selectedCell.colIndex);
        '#'.concat(this.mapArrayKeyToName(this.props.data, selectedCell.fieldSelectorSelectedValue))
            .split('')
            .forEach((gridDataValue) => {
                let editCellValue = {};
                editCellValue[colIndex] = gridDataValue;
                if (!gridData[rowIndex]) {
                    gridData[rowIndex] = {};
                }
                Object.assign(gridData[rowIndex], editCellValue);
                colIndex++;
            });
        if (selectedCell.fieldSelectorSelectedValueLength < prevSelectedValueLength) {
            let startIdx = colIndex;
            let endIdx = colIndex + prevSelectedValueLength - selectedCell.fieldSelectorSelectedValueLength - 1;
            gridData[rowIndex] = this.removeDataFromGridRow(gridData[selectedCell.rowIndex], startIdx, endIdx);
        }
        return gridData;
    }
    removeFieldFromSelectedData(selectedData, selectedCell) {
        return selectedData.filter((value) => {
            return value.colIndex !== selectedCell.colIndex || value.rowIndex !== selectedCell.rowIndex;
        });
    }
    removeDataFromGridRow(gridRow, startIdx, endIdx) {
        let newRow = {};
        let newKeyFound = false;
        Object.keys(gridRow).forEach((key) => {
            if (parseInt(key) < startIdx || parseInt(key) > endIdx || newKeyFound) {
                newRow[key] = gridRow[key];
            } else {
                if (parseInt(key) !== startIdx && gridRow[key] === '#') {
                    newRow[key] = gridRow[key];
                    newKeyFound = true;
                }
            }
        });
        return newRow;
    }
    removeSelectionFromGridData(selectedCell, gridData, selectedData) {
        let startIdx = selectedCell.colIndex;
        let endIdx = ('#'.concat(this.mapArrayKeyToName(this.props.data, selectedData.filter((value) => {
            return value.colIndex === selectedCell.colIndex && value.rowIndex === selectedCell.rowIndex;
        }).pop().fieldSelectorSelectedValue))).length + startIdx;
        selectedData = this.removeFieldFromSelectedData(selectedData, selectedCell);
        gridData[selectedCell.rowIndex] = this.removeDataFromGridRow(gridData[selectedCell.rowIndex], startIdx, endIdx);
        return {
            gridData: gridData,
            selectedData: selectedData
        };
    }
    handleChangeMailerWidth(value) {
        let newValue = value.value;
        let validate = mailerSizeValidator(newValue, mailerSizeStep.width);
        this.props.setErrors({
            pinMailerWidth: validate.errorMessage
        });
        if (validate.isValid) {
            this.props.setGridFields(this.constructGridFields(newValue), this.constructSpanFields(newValue, colsPerInch), this.formatMailerSize(newValue));
        } else {
            this.props.setMailerWidth(newValue);
        }
    }
    handleChangeMailerHeight(value) {
        let newValue = value.value;
        let validate = mailerSizeValidator(newValue, mailerSizeStep.height);
        this.props.setErrors({
            pinMailerHeight: validate.errorMessage
        });
        if (validate.isValid) {
            this.props.setVerticalData({
                verticalFields: this.constructVerticalFields(newValue),
                verticalSpanFields: this.constructSpanFields(newValue, rowsPerInch)
            });
            this.props.setGridData(this.constructGridData(newValue, this.props.gridData), this.formatMailerSize(newValue));
        } else {
            this.props.setMailerHeight(newValue);
        }
    }
    handleCellClick(rowData, column, cellData, rowIndex) {
        if (parseInt(column.name) > 0) {
            let allowSelectPlaceholder = false;
            let prevSelectedValueLength = 0;
            let selectedCell = {
                rowIndex: rowIndex,
                colIndex: parseInt(column.name),
                fieldSelectorSelectedValue: null,
                fieldSelectorSelectedValueLength: null
            };
            let existingCell = this.props.selectedData.filter((selectedValue) => {
                return (selectedValue.rowIndex === rowIndex) &&
                    (selectedValue.colIndex <= parseInt(column.name)) &&
                    (selectedValue.colIndex + selectedValue.fieldSelectorSelectedValueLength >= parseInt(column.name));
            });
            if (existingCell.length === 1) {
                existingCell = existingCell.pop();
                prevSelectedValueLength = existingCell.fieldSelectorSelectedValueLength;
                selectedCell = existingCell;
                allowSelectPlaceholder = true;
            }
            this.props.openFieldSelector({selectedCell: selectedCell, allowSelectPlaceholder: allowSelectPlaceholder, prevSelectedValueLength: prevSelectedValueLength});
        }
    }
    render() {
                    /* <Col className={style.labelWrap} >
                        <Text>Mailer width</Text>
                    </Col>
                    <Col className={style.componentsWrap} >
                        <NumericInput
                          min={1.0}
                          max={11.7}
                          value={this.props.mailerProperties.pinMailerWidth}
                          step={0.1}
                          precision={1}
                          onChange={this.handleChangeMailerWidth}
                          style={{
                              input: {
                                  width: '70px',
                                  height: '30px'
                              }
                          }}
                        />
                    </Col>
                    <Col className={style.labelWrap} >
                        <Text>inches</Text>
                    </Col>
                    <Col className={style.labelWrap} >
                        <Text>Mailer height</Text>
                    </Col>
                    <Col className={style.componentsWrap} >
                        <NumericInput
                          min={1.0}
                          max={11.5}
                          value={4.0}
                          step={0.5}
                          precision={1}
                          style={{
                              input: {
                                  width: '70px',
                                  height: '30px'
                              }
                          }}
                        />
                    </Col>
                    <Col className={style.labelWrap} >
                        <Text>inches</Text>
                    </Col> */

        return (
            <div>
                <Container className={style.containerWrap}>
                <Row>
                    <Col className={style.componentsWrap}>
                        <Input
                          label={<Text>Mailer width</Text>}
                          value={this.props.mailerProperties.pinMailerWidth}
                          onChange={this.handleChangeMailerWidth}
                          boldLabel
                          wrapperClassName={style.outerWrap}
                          labelClassName={style.lableWrap}
                          inputWrapClassName={style.inputWrap}
                          isValid={this.props.errors.get('pinMailerWidth') === undefined}
                          errorMessage={this.props.errors.get('pinMailerWidth')}
                        />
                    </Col>
                    <Col className={style.inchesWrap} >
                        <Text>inches</Text>
                    </Col>
                    <Col className={style.componentsWrap}>
                        <Input
                          label={<Text>Mailer height</Text>}
                          value={this.props.mailerProperties.pinMailerHeight}
                          onChange={this.handleChangeMailerHeight}
                          boldLabel
                          wrapperClassName={style.outerWrap}
                          labelClassName={style.lableWrap}
                          inputWrapClassName={style.inputWrap}
                          isValid={this.props.errors.get('pinMailerHeight') === undefined}
                          errorMessage={this.props.errors.get('pinMailerHeight')}
                        />
                    </Col>
                    <Col className={style.inchesWrap} >
                        <Text>inches</Text>
                    </Col>
                    <Col className={style.checkBoxWrap} >
                        <Checkbox
                          label='Continuous paper'
                          checked={this.props.continuousPaper}
                          onClick={this.props.handleContinuousPaperClick}
                        />
                    </Col>
                </Row>
                </Container>
                <div className={printFormatStyle.componentsWrap} >
                    <Input
                      label={<Text>Currrent print format</Text>}
                      value={this.props.printFormatString}
                      readonly
                      wrapperClassName={printFormatStyle.outerWrap}
                      labelClassName={printFormatStyle.lableWrap}
                      inputWrapClassName={printFormatStyle.inputWrap}
                    />
                </div>
                <div className={style.tableWrap} >
                    <SimpleGrid
                      fields={this.props.gridFields}
                      data={this.props.gridData}
                      spanFields={this.props.spanFields}
                      emptyRowsMsg={''}
                      toggleColumnVisibility={function() { return 0; }}
                      handleCellClick={this.handleCellClick}
                      rowsChecked={undefined}
                      orderBy={undefined}
                      externalStyle={style}
                      verticalFields={this.props.verticalFields}
                      verticalSpanFields={this.props.verticalSpanFields}
                      verticalFieldsRenderComplete
                      verticalFieldsVisible
                    />
                </div>
                <PINMailerFieldSelector />
            </div>
        );
    }
};

PINMailerGrid.propTypes = {
    changeId: PropTypes.number.isRequired,
    mailerProperties: PropTypes.object,
    prevSelectedValueLength: PropTypes.number,
    selectedCell: PropTypes.object,
    continuousPaper: PropTypes.bool,
    gridFields: PropTypes.array,
    spanFields: PropTypes.array,
    verticalFields: PropTypes.array,
    verticalSpanFields: PropTypes.array,
    gridData: PropTypes.array,
    printFormatString: PropTypes.string,
    printFormatStringFromDb: PropTypes.bool.isRequired,
    selectedData: PropTypes.array,
    data: PropTypes.array,
    errors: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    openFieldSelector: PropTypes.func.isRequired,
    handleContinuousPaperClick: PropTypes.func.isRequired,
    setContinuousPaperValue: PropTypes.func.isRequired,
    setPrintFormatString: PropTypes.func.isRequired,
    setPrintFormatStringFromDb: PropTypes.func.isRequired,
    setVerticalData: PropTypes.func.isRequired,
    setGridFields: PropTypes.func.isRequired,
    setGridData: PropTypes.func.isRequired,
    setSelectedData: PropTypes.func.isRequired,
    setMailerWidth: PropTypes.func.isRequired,
    setMailerHeight: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            changeId: state.pinMailerGrid.get('changeId'),
            mailerProperties: state.pinMailerGrid.get('mailerProperties').toJS(),
            prevSelectedValueLength: state.pinMailerGrid.get('prevSelectedValueLength'),
            selectedCell: state.pinMailerGrid.get('selectedCell').toJS(),
            continuousPaper: state.pinMailerGrid.get('continuousPaper'),
            gridFields: state.pinMailerGrid.get('gridFields').toJS(),
            spanFields: state.pinMailerGrid.get('spanFields').toJS(),
            verticalFields: state.pinMailerGrid.get('verticalFields').toJS(),
            verticalSpanFields: state.pinMailerGrid.get('verticalSpanFields').toJS(),
            gridData: state.pinMailerGrid.get('gridData').toJS(),
            printFormatString: state.pinMailerGrid.get('printFormatString'),
            printFormatStringFromDb: state.pinMailerGrid.get('printFormatStringFromDb'),
            selectedData: state.pinMailerGrid.get('selectedData').toJS(),
            data: state.pinMailerGrid.get('data').toJS(),
            errors: state.pinMailerGrid.get('errors')
        };
    },
    {fetch, openFieldSelector, handleContinuousPaperClick, setContinuousPaperValue, setPrintFormatString, setPrintFormatStringFromDb, setVerticalData, setGridFields, setGridData, setSelectedData, setMailerWidth, setMailerHeight, setErrors}
)(PINMailerGrid);
