import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import style from './style.css';

export default class TitledContentBox extends Component {
    render() {
        return (
            <div className={style.wrapper}>

                <div className={style.header}>
                    <span className={style.headerText}>{this.props.title}</span>
                    { this.props.headerButton && <span className={style.headerRightButton} onClick={this.props.onHeaderButtonClick}>{this.props.headerButton}</span>}
                </div>

                <div className={classnames(style.box, style.content)}>
                    {this.props.inputs}
                    {this.props.children}
                </div>
            </div>
        );
    }
};

TitledContentBox.propTypes = {
    title: PropTypes.string,
    children: PropTypes.any,
    inputs: PropTypes.array,
    headerButton: PropTypes.string,
    onHeaderButtonClick: PropTypes.func
};
