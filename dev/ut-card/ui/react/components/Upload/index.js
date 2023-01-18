import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import Text from 'ut-front-react/components/Text';
import Input from 'ut-front-react/components/Input';
import style from './style.css';
import dropdownStyles from './dropdownStyles.css';

const contentRegex = /data:(.*?);base64,(.*)/;
import {documentPrefix} from './../../containers/constants';

export class Upload extends Component {
    constructor(props) {
        super(props);
        this.typeChange = this.typeChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onLabelClick = this.onLabelClick.bind(this);
        this.setRef = this.setRef.bind(this);
        this.state = {value: ''};
    }
    typeChange(data) {
        this.props.typeChange(data, this.props.arrayIndex);
    }
    onRemove() {
        this.props.removeUpload(this.props.arrayIndex);
    }
    onLabelClick() {
        this.upload.click();
    }
    setRef(input) {
        this.upload = input;
    }
    uploadDocument(file) {
        var data = new window.FormData();
        data.append('file', file);

        var request = new window.XMLHttpRequest();
        request.open('POST', '/file-upload', true);
        request.onload = (e) => {
            this.props.hidePreload();
            if (request.status >= 200 && request.status < 300 && request.responseText) {
                let reader = new window.FileReader();
                reader.onload = (data) => {
                    let response = JSON.parse(request.responseText);
                    let content = contentRegex.exec(data.target.result);
                    let attachment = {
                        content: content[2],
                        contentType: content[1],
                        contentEncoding: 'base64',
                        isNew: true,
                        filename: response.filename
                    };
                    this.props.changeFile(attachment, this.props.arrayIndex);
                };
                reader.readAsDataURL(file);
            } else {
                let response = {message: 'Invalid Document'};
                this.props.errorWindowToggle({message: {message: response.message}});
            }
        };
        this.props.showPreload();
        request.send(data);
    }
    onChange(e) {
        let file = e.target.files[0];
        file && this.uploadDocument(file);
    }
    getContentImage() {
        let data = this.props.attachment;
        let result = `data:${data.get('contentType')};${data.get('contentEncoding')},${data.get('content')}`;
        return result;
    }
    render() {
        let {types, attachment, readOnly} = this.props;
        let imageUrl = `${documentPrefix}${attachment.get('filename')}`;
        let viewHref = attachment.get('content') ? this.getContentImage() : imageUrl;
        return (
            <div>
                <div className={style.dropdownWrapper}>
                    <Dropdown
                      defaultSelected={attachment.get('documentTypeId')}
                      placeholder='Select Type'
                      keyProp='documentTypeId'
                      disabled={readOnly}
                      mergeStyles={dropdownStyles}
                      onSelect={this.typeChange}
                      data={types}
                      isValid={this.props.errors && this.props.errors.get(this.props.arrayIndex) === undefined}
                      errorMessage={'Please select document type.'}
                    />
                </div>
                <input type='file' className={style.defaultInputWrapper} ref={this.setRef} onChange={this.onChange} />
                <div className={style.infoInputWrapper}>
                    <Input value={attachment.get('filename')} readonly />
                </div>
                <div className={style.buttonsWrapper}>
                    <div className={style.buttonsInnerWrapper}>
                        {!readOnly && <span className={style.browseBtn} onClick={this.onLabelClick}><Text>Browse</Text>...</span>}
                        {(attachment.get('filename') && !readOnly) && <span className={classnames(style.button, style.removeAttachment)} onClick={this.onRemove}><Text>Remove</Text></span>}
                        {attachment.get('filename') && <a href={viewHref} target='_blank' className={classnames(style.button, style.viewAttachment)}>View</a>}
                        {(attachment.get('filename') && readOnly) && <a href={imageUrl} download={attachment.get('filename')} className={classnames(style.button, style.downloadAttachment)}><Text>Download</Text></a>}
                    </div>
                </div>
            </div>
        );
    }
}

Upload.propTypes = {
    types: PropTypes.array,
    readOnly: PropTypes.bool,
    arrayIndex: PropTypes.number,
    attachment: PropTypes.object,
    errors: PropTypes.object,
    typeChange: PropTypes.func.isRequired,

    changeFile: PropTypes.func.isRequired,

    removeUpload: PropTypes.func.isRequired,

    showPreload: PropTypes.func.isRequired,
    hidePreload: PropTypes.func.isRequired,
    errorWindowToggle: PropTypes.func.isRequired
};

Upload.defaultProps = {
    readOnly: false,
    typeChange: () => {},
    changeFile: () => {},
    removeUpload: () => {},

    showPreload: () => {},
    hidePreload: () => {}
};

export default Upload;
