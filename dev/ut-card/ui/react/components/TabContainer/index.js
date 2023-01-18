import React, { Component, PropTypes } from 'react';
import immutable from 'immutable';
import Tabs from 'ut-front-react/components/Tabs';

import classnames from 'classnames';
import style from './style.css';

class TabContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 0,
            statusObj: immutable.Map({})
        };
    }

    hasPrev() {
        return this.state.active > 0;
    }

    hasNext() {
        return this.state.active < this.props.tabs.length - 1;
    }

    render() {
        let { tabs } = this.props;
        let activeTab = tabs[this.state.active];
        let handleTabClick = ({id}) => {
            this.setState({active: id});
        };

        return (
            <div className={style.tabContainerWrap}>
                <div className={classnames(style.bottomBorderderWrap, style.tabMenuWrap)}>
                    <Tabs
                      tabs={tabs.map(({title}, id) => ({title, id}))}
                      activeTab={this.state.active}
                      onClick={handleTabClick}
                    />
                </div>

                <div className={style.contentComponentWrapper}>
                    {activeTab.component}
                </div>
            </div>
        );
    }
}

TabContainer.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            component: PropTypes.element.isRequired
        })
    ).isRequired,
    actionButtons: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            isDisabled: PropTypes.bool,
            onClick: PropTypes.func
        })
    )
};

TabContainer.defaultProps = {
    actionButtons: [],
    errors: immutable.List([]),
    allowTabSwithIfNotValid: false,
    onErrors: () => {}
};

export default TabContainer;
