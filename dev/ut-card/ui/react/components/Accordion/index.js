import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import style from './style.css';
import AccordionMain from 'ut-front-react/components/Accordion';

export default class Accordion extends Component {
    render() {
        let externalTitleClasses = classnames(style.title, this.props.externalTitleClasses);
        let externalBodyClasses = classnames(style.body, this.props.externalBodyClasses);
        return (
            <AccordionMain title={this.props.title} externalTitleClasses={externalTitleClasses} externalBodyClasses={externalBodyClasses}>
                {this.props.children}
            </AccordionMain>
        );
    }
};

Accordion.propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.any,
    externalTitleClasses: PropTypes.string,
    externalBodyClasses: PropTypes.string
};
