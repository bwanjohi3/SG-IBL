import { connect } from 'react-redux';
import BusinessUnitsTree from 'ut-core/ui/react/containers/BusinessUnits';
import {setParentBusinessUnit as onActiveClick} from './actions';

let mapStateToProps = () => {
    return {
        identifier: 'businessUnitsListCardApplications',
        showUnselectAll: true,
        styles: {main: {height: '100%', paddingTop: '70px'}} // styles considers 'Unselect all' button
    };
};

export default connect(
    mapStateToProps,
    {onActiveClick}
)(BusinessUnitsTree);
