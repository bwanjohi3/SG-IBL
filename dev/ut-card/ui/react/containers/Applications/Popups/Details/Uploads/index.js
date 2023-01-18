import {connect} from 'react-redux';
import MultipleUpload from '../../../../../components/MultipleUpload';
import {typeChange, changeFile, removeUpload, onAddDocument} from './actions';
import {showPreload, hidePreload} from './../../../../../actions';
import {errorWindowToggle} from 'ut-front-react/pages/Master/actions.js';

const Uploads = connect(
    (state, ownProps) => {
        return {
            withTopMargin: ownProps.withTopMargin,
            attachments: state.cardApplicationDetailsUploads.get('attachments'),
            types: state.cardApplicationDetailsUploads.get('types'),
            errors: state.cardApplicationDetailsUploads.get('errors')
        };
    },
    {typeChange, changeFile, removeUpload, onAddDocument, showPreload, hidePreload, errorWindowToggle}
)(MultipleUpload);

export default Uploads;
