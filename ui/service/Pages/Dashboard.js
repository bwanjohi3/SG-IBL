import React from 'react';
import {Dashboard} from 'ut-front-react/containers/Dashboard';

export default React.createClass({
    render() {
        return (
            <Dashboard {...this.props} tabName='Dashboard' pageText='Solution Dashboard' />
        );
    }
});
