import {connect} from 'react-redux';
import MultipleUpload from '../../../../../components/MultipleUpload';
import {errorWindowToggle} from 'ut-front-react/pages/Master/actions.js';

export default connect(
    (state, ownProps) => {
        return {
            readOnly: true,
            withTopMargin: ownProps.withTopMargin,
            attachments: state.cardDetailsPopup.getIn(['card', 'attachments']),
            types: state.cardManagementDocument.get('types')
        };
    },
    {errorWindowToggle}
)(MultipleUpload);
