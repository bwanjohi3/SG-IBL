import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import Text from 'ut-front-react/components/Text';
import Accordion from './../Accordion';
import Upload from './../Upload';
import Icon from 'ut-front-react/components/Icon';
import style from './style.css';

export class MultipleUpload extends Component {
    render() {
        let {attachments, types, onAddDocument, ...otherProps} = this.props;
        let typesMutable = types.toJS();
        return (
            <div className={classnames({[style.topMargin]: this.props.withTopMargin})}>
                <Accordion title={<Text>Uploads</Text>}>
                    <div className={style.accordionContent}>
                        {attachments.map((attachment, i) => {
                            return <Upload key={i} arrayIndex={i} attachment={attachment} types={typesMutable} {...otherProps} />;
                        })}
                        {!attachments.size && <div className={style.noDocuments}><Text>No Documents</Text></div>}
                        {!this.props.readOnly && <div>
                            <span onClick={onAddDocument} className={style.addDocumentWrapper}><Icon icon='add' /><span className={style.addDocumentLabel}><Text>Add Document</Text></span></span>
                        </div>}
                    </div>
                </Accordion>
            </div>
        );
    }
}

MultipleUpload.propTypes = {
    withTopMargin: PropTypes.bool,
    attachments: PropTypes.object.isRequired,
    types: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,

    onAddDocument: PropTypes.func.isRequired
};

MultipleUpload.defaultProps = {
    onAddDocument: () => {}
};

export default MultipleUpload;
