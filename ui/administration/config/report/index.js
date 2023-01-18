import transferReports from 'ut-transfer/reports';
import cardReports from 'ut-card/reports';
import atmReports from 'ut-atm/reports';

import style from './style.css';

export const reportConfig = Object.assign({},
    cardReports(style),
    transferReports(style),
    atmReports(style)
);
