import React from 'react';
import Layout from 'ut-front-react/pages/Layout';

export default React.createClass({
    render() {
        return (
            <Layout {...this.props} headerText='Administration\nPortal' />
        );
    }
});
