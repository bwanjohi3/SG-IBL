import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Main extends Component {
    render() {
        return this.props.children;
    }
};

Main.propTypes = {
    children: PropTypes.node
};

export default connect((state, ownProps) => ({}), {})(Main);
