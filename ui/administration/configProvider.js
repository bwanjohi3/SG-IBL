import { Component, PropTypes, Children } from 'react';
import { connect } from 'react-redux';
import { setConfig as setCardConfig } from 'ut-card/ui/react/actions.js';
import { setConfig as setUserConfig } from 'ut-user/ui/react/configuration/actions.js';
import { setConfig as setReportConfig } from 'ut-report/ui/react/configuration/actions.js';
import { setConfig as setAtmConfig } from 'ut-atm/ui/react/actions';
import { setConfig as setPosConfig } from 'ut-pos/ui/react/actions';
import { setConfig as setRuleConfig } from 'ut-rule/ui/react/configuration/actions.js';

import { userConfig } from './config/user';
import { cardConfig } from './config/card';
import { reportConfig } from './config/report';
import { atmConfig } from './config/atm';
import { posConfig } from './config/pos';
import { ruleConfig } from './config/rule';


class ConfigProvider extends Component {
    componentDidMount() {
        this.props.setUserConfig(userConfig);
        this.props.setCardConfig(cardConfig);
        this.props.setReportConfig(reportConfig);
        this.props.setAtmConfig(atmConfig);
        this.props.setPosConfig(posConfig);
        this.props.setRuleConfig(ruleConfig);
    }
    render() {
        let { children } = this.props;
        return Children.only(children);
    }
}

ConfigProvider.propTypes = {
    setUserConfig: PropTypes.func,
    setCardConfig: PropTypes.func,
    setReportConfig: PropTypes.func,
    setAtmConfig: PropTypes.func,
    setPosConfig: PropTypes.func,
    setRuleConfig: PropTypes.func,

    children: PropTypes.node
};

export default connect(
    null,
    { setUserConfig, setCardConfig, setReportConfig, setAtmConfig, setPosConfig, setRuleConfig }
)(ConfigProvider);
