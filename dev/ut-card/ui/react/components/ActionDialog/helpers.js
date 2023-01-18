import React from 'react';
import Text from 'ut-front-react/components/Text';
import dialogStyles from './style.css';

export function getDialogTitle(titleText, onClose) {
    return <div className={dialogStyles.titleWrap}>
        <div className={dialogStyles.title}><Text>{titleText}</Text></div>
        {onClose && <span onTouchTap={onClose} className={dialogStyles.closeBtn} />}
    </div>;
};

// use ./style.css titleWrap className instead
export const titleStyle = {
    backgroundColor: '#F5F5F5',
    padding: '5px 0',
    borderBottom: '1px solid #E6E6E6'
};

// use ./styles.css actionButtons className instead
export const actionsStyle = {
    borderTop: '1px solid #E6E6E6',
    backgroundColor: '#F5F5F5',
    padding: '5px'
};
