import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import {List} from 'immutable';
import Text from 'ut-front-react/components/Text';

import {toggle as toggleEdit} from '../DialogScreens/Edit/actions';
import {toggle as toggleDelete} from '../DialogScreens/Delete/actions';
import {toggle as toggleStatusUpdate} from '../DialogScreens/StatusUpdate/actions';
import style from '../../../components/ActionStatusButton/style.css';

class ActionButtons extends Component {
    render() {
        let { gridProps } = this.props;

        let currentStatuses = gridProps.reduce((prev, cur) => {
            if (!~prev.indexOf(cur.get('isActive'))) {
                prev = prev.push(cur.get('isActive'));
            }

            return prev;
        }, List());

        let viewDisabled = (gridProps.size !== 1);
        return (
            <div>
                {this.context.checkPermission('card.reason.get') &&
                 <button style={{margin: '0 5px 0 0'}} className={classnames(style.statusActionButton, (viewDisabled && style.statusActionButtonDisabled))}
                   disabled={viewDisabled} onTouchTap={() => { !viewDisabled && this.props.toggleEdit(); }}>
                        <Text>Details</Text>
                 </button>
                }
                {this.context.checkPermission('card.reason.delete') && gridProps.size > 0 &&
                <button style={{margin: '0 5px 0 0'}} className={style.statusActionButton}
                  onTouchTap={() => { this.props.toggleDelete(); }}>
                    <Text>Delete</Text>
                </button>
                }
                {this.context.checkPermission('card.reason.statusUpdate') && gridProps.size > 0 && currentStatuses.size < 2 &&
                <button style={{margin: '0 5px 0 0'}} className={style.statusActionButton}
                  onTouchTap={() => { this.props.toggleStatusUpdate(); }}>
                    <Text>{currentStatuses.get(0) ? 'Deactivate' : 'Activate'}</Text>
                </button>
                }
            </div>
        );
    }
};

ActionButtons.propTypes = {
    // data
    gridProps: PropTypes.object.isRequired,
    // Actions
    toggleEdit: PropTypes.func.isRequired,
    toggleDelete: PropTypes.func.isRequired,
    toggleStatusUpdate: PropTypes.func.isRequired
};
ActionButtons.defaultProps = {
    toolbox: false
};
ActionButtons.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state) => {
        return {
            gridProps: state.cardReasonGrid.get('selected').size > 0 ? state.cardReasonGrid.get('selected') : state.cardReasonGrid.get('checked')
        };
    }, {toggleEdit, toggleDelete, toggleStatusUpdate}
)(ActionButtons);
