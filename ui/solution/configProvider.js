import { Component, PropTypes, Children } from 'react';
import { connect } from 'react-redux';

import { setConfig as setCardConfig } from 'ut-card/ui/react/actions.js';
import { setConfig as setUserConfig } from 'ut-user/ui/react/configuration/actions.js';

import { userConfig } from './config/user.js';
import { cardConfig } from './config/card.js';

class ConfigProvider extends Component {
    componentDidMount() {
        this.props.setUserConfig(userConfig);
        this.props.setCardConfig(cardConfig);
    }
    render() {
        let { children } = this.props;
        return Children.only(children);
    }
}

ConfigProvider.propTypes = {
    setUserConfig: PropTypes.func,
    setCardConfig: PropTypes.func,
    children: PropTypes.node
};

export default connect(
    null,
    { setUserConfig, setCardConfig }
)(ConfigProvider);
