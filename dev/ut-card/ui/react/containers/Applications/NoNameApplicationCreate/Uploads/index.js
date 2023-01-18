import {connect} from 'react-redux';
import MultipleUpload from '../../../../components/MultipleUpload';
import {typeChange, changeFile, removeUpload, onAddDocument} from './actions';
import {showPreload, hidePreload} from './../../../../actions';
import {errorWindowToggle} from 'ut-front-react/pages/Master/actions.js';

const Uploads = connect(
    (state, ownProps) => {
        return {
            withTopMargin: ownProps.withTopMargin,
            attachments: state.cardNoNameApplicationUploads.get('attachments'),
            types: state.cardNoNameApplicationUploads.get('types'),
            errors: state.cardNoNameApplicationUploads.get('errors')
        };
    },
    {typeChange, changeFile, removeUpload, onAddDocument, showPreload, hidePreload, errorWindowToggle}
)(MultipleUpload);

export default Uploads;
