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
        this.onChange = this.onChange.bind(this);
        this.onRemove = this.onRemove.bind(this);
        this.onLabelClick = this.onLabelClick.bind(this);
        this.setRef = this.setRef.bind(this);
        this.attachmentView = this.attachmentView.bind(this);

        this.state = {value: ''};
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
        if (this.props.validateFile(file)) {
            file && this.uploadDocument(file);
        } else {
            let response = {message: 'Invalid Document'};
            this.props.errorWindowToggle({message: {message: response.message}});
        }
    }
    getContentImage() {
        let data = this.props.attachment;
        let result = `data:${data.get('contentType')};${data.get('contentEncoding')},${data.get('content')}`;
        return result;
    }
    attachmentView() {
        let { attachment } = this.props;
        if (attachment.get('content')) {
            let onClick = () => {
                let newTab = window.open();

                newTab.document.body.style.backgroundColor = '#0e0e0e';

                newTab.document.body.innerHTML = (
                    `<img src=${this.getContentImage()}
                      style='position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto' />`
                );
            };

            return <a onClick={onClick} className={classnames(style.button, style.viewAttachment)}>View</a>;
        }

        return <a href={`${documentPrefix}${attachment.get('filename')}`} target='_blank' className={classnames(style.button, style.viewAttachment)}>View</a>;
    }
    render() {
        let {label, attachment, readOnly} = this.props;
        
        return (
            <div>
                {label ? (<span className={style.uploadLabel}>{label}</span>) : ''}
                <input type='file' className={style.defaultInputWrapper} ref={this.setRef} onChange={this.onChange} />
                <div className={style.infoInputWrapper}>
                    <Input  value={attachment && attachment.filename} readonly />
                </div>
                <div className={style.buttonsWrapper}>
                    <div className={style.buttonsInnerWrapper}>
                        {!readOnly && <span className={style.browseBtn} onClick={this.onLabelClick}><Text>Browse</Text>...</span>}
                    </div>
                </div>
            </div>
        );
    }
}

Upload.propTypes = {
    readOnly: PropTypes.bool,
    arrayIndex: PropTypes.number,
    attachment: PropTypes.object,
    errors: PropTypes.object,

    changeFile: PropTypes.func.isRequired,
    validateFile: PropTypes.func.isRequired,
    removeUpload: PropTypes.func.isRequired,

    showPreload: PropTypes.func.isRequired,
    hidePreload: PropTypes.func.isRequired,
    errorWindowToggle: PropTypes.func.isRequired,
    label: PropTypes.node
};

Upload.defaultProps = {
    readOnly: false,
    changeFile: () => {},
    removeUpload: () => {},
    errorWindowToggle: () => {},
    showPreload: () => {},
    hidePreload: () => {},
    validateFile: () => {return true;}
};

export default Upload;
