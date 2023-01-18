import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import MultipleUpload from '../../../../components/MultipleUpload';
import {typeChange, changeFile, removeUpload, onAddDocument, fetchDocumentTypes} from './actions';
import {showPreload, hidePreload} from './../../../../actions';
import {errorWindowToggle} from 'ut-front-react/pages/Master/actions.js';

class CardInUseDocument extends Component {
    componentWillMount() {
        if (!this.props.types.size) {
            this.props.fetchDocumentTypes();
        }
    }
    componentWillReceiveProps(nextProps) {
        if (!nextProps.types.size) {
            this.props.fetchDocumentTypes();
        }
    }
    render() {
        return (
            <MultipleUpload {...this.props} />
        );
    };
}

CardInUseDocument.propTypes = {
    types: PropTypes.object.isRequired, // immutable list
    attachments: PropTypes.object, // immutable list
    readOnly: PropTypes.bool.isRequired,

    fetchDocumentTypes: PropTypes.func.isRequired,
    changeFile: PropTypes.func.isRequired,
    removeUpload: PropTypes.func.isRequired,
    onAddDocument: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            attachments: state.cardInUseDocument.get('attachments'),
            types: state.cardInUseDocument.get('types')
        };
    },
    {typeChange, changeFile, removeUpload, onAddDocument, fetchDocumentTypes, showPreload, hidePreload, errorWindowToggle}
)(CardInUseDocument);
