import React, { PropTypes } from 'react';
import Popover from 'material-ui/Popover';
import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import ReloadIcon from 'material-ui/svg-icons/action/autorenew';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

export default React.createClass({
    propTypes: {
        data: PropTypes.object,
        onClose: PropTypes.func,
        refresh: PropTypes.func
    },
    getInitialState() {
        return {
            shouldUpdate: true,
            contextMenu: {
                open: false,
                anchorEl: null
            },
            data: {}
        };
    },
    show(event) {
        event.preventDefault();
        this.setState({
            contextMenu: {
                open: true,
                anchorEl: event.currentTarget
            }
        });
    },
    hide() {
        this.setState({
            shouldUpdate: true,
            contextMenu: {
                open: false,
                anchorEl: null
            }
        });
        this.props.onClose(this.state.data);
    },
    shouldComponentUpdate() {
        return this.state.shouldUpdate;
    },
    componentWillMount() {
        this.setState({
            data: Object.assign({}, this.props.data)
        });
    },
    checkBoxChecked(event, checked, record) {
        let data = this.state.data;
        let checkedValueCount = 0;
        for (let property in data) {
            data[property].visible && checkedValueCount++;
        }
        if (!(checkedValueCount === 1 && data[record].visible)) {
            data[record].visible = checked;
            this.setState({
                shouldUpdate: true,
                data: data
            });
        } else {
            this.setState({
                shouldUpdate: false,
                data: data
            });
        }
    },
    render() {
        var data = this.state.data;
        return <div style={{float: 'left'}}>
            <SettingsIcon onClick={this.show} />
            <Popover
              open={this.state.contextMenu.open}
              anchorEl={this.state.contextMenu.anchorEl}
              autoCloseWhenOffScreen
              anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              onRequestClose={this.hide}
            >
                <div style={{width: '200px'}}>
                    <List ref='list'>
                        {
                            [
                                <ListItem key={0} primaryText='Reload Grid' onClick={this.props.refresh} leftIcon={<ReloadIcon />} />,
                                <Divider key={1} />,
                                <Subheader key={2}>Manage Columns</Subheader>
                            ].concat(Object.keys(data).map((record, i) => {
                                let checkBoxChecked = (event, checked) => this.checkBoxChecked(event, checked, record);
                                return <ListItem
                                  key={i + 3}
                                  leftCheckbox={
                                    <Checkbox
                                      checked={data[record].visible}
                                      onCheck={checkBoxChecked}
                                  />}
                                  primaryText={data[record].title}
                                />;
                            }))
                        }
                    </List>
                </div>
            </Popover>
        </div>;
    }
});
