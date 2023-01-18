var utils = require('./receipts/utils');
const PATH = 'IBL_';
// const PATH = 'UTSwitchNBV_';
const EXT = '.BMP';
const SHOW = img => `\u000c\u001bPE${PATH}${img}${EXT}\u001b\\`;
const applyLanguage = (number, language) => ('0000' + (parseInt(number) + ((language == null) ? 0 : language))).slice(-number.length);
const image = name => ({language}) => SHOW(applyLanguage(name, language));
const screenImage = name => ({screen, language}) => applyLanguage(screen, language) + image(name)({language});
const money = amount => utils.formatAmount(amount).toUpperCase();
const upper = string => (string && string.toUpperCase()) || '';

var accountsDisplay2 = (accounts)=> {
        var displayMapper = ['O', 'L', 'I', 'F'];
        var display ="";
        for(var i=0;i<accounts.length;i++){
           display+= '\u000f'+displayMapper[i]+'O'+accounts[i];
        }
        return display;
    }

module.exports = (variant) => ({
    screens: {
        EMPTY: '075', // empty screen, which is updated with error images in various error cases
        TXDENIED_TAKE_CARD: '011', // screens showing that transaction was denied also shows 'take card' message
        TAKE_RECEIPT: '013', // screen showing message 'take receipt'

        SHOW_WITHDRAW: '068', // screen containing 2 nested screens showing message 'take card', then message 'take cash'
        SHOW_TRANSFER: '101', // screen showing message for transfer success
        SHOW_BALANCE: '046', // screen for showing balance
        SHOW_ACCOUNTS: '066', // Screen for selecting an account be and ms
        SHOW_MINISTATEMENT: '047', // screen for showing ministatement
        SHOW_TOPUP: '104', // screen showing message for transfer success
        SHOW_CHEQUEBOOK:'046',
        SELECT_ACCOUNT_TRANSFER: '070', // screen for selecting recipient account
        SELECT_ACCOUNT: '066', // screen for selecting own account
        SELECT_ACCOUNT_FROM: '100' // screen for selecting transfer from account
    },
    images: {
        SHOW_WITHDRAW: ({transfer, language}) =>
            `${applyLanguage('012', language)}\u000f@@\u001bPE${PATH}${applyLanguage('012', language)}${EXT}\u001b\\` +
            `\u001b[00;23;80m\u000fDK${upper(transfer.sourceAccountName)}` +
            `\u000fEK${money(transfer.amount.transfer)}` +
            `\u000fFK${money(transfer.balance.available)}`,
        SHOW_CHEQUEBOOK : ({screen, transfer, language}) => // screen for showing balance
            `${applyLanguage(screen, language) + image('067')({language})}\u001b[00;23;80m` 
            ,
        SHOW_BALANCE: ({screen, transfer, language}) => // screen for showing balance
            `${applyLanguage(screen, language) + image('046')({language})}\u001b[00;23;80m` +
            `\u000fFN${money(transfer.balance.available)}`+
            `\u000fGN${money(transfer.balance.ledger)}`,
        SHOW_ACCOUNTS: ({screen, transfer, language}) => // screen for showing balance
            `${applyLanguage(screen, language) + image('066')({language})}\u001b[00;23;80m` +
            accountsDisplay2(transfer),
        SHOW_MINISTATEMENT: ({screen, transfer, language}) => // screen for showing mini statement
            `${applyLanguage(screen, language) + image('047')({language})}\u001b(2\u001b[00;23;80m` +
            `\u000fF@${(transfer.ministatement.statement && transfer.ministatement.statement.lines) || ''}` +
            `\u000fLN${money(transfer.balance.available)}` +            
            `\u000fMN${money(transfer.balance.ledger)}`
            ,
        SHOW_TRANSFER: ({screen, transfer, language}) => // screen showing message for transfer success
            `${applyLanguage(screen, language) + image('101')({language})}\u001b[00;23;80m` +
            `\u000fFN${transfer.amount.transfer.amount}` +
            `\u000fGN${money(transfer.balance.available)}` +
            `\u000fHN${money(transfer.balance.ledger)}`,
        SHOW_TOPUP: ({screen, transfer, language}) => // screen showing message for transfer success
            `${applyLanguage(screen, language) + image('104')({language})}\u001b[00;23;80m` +
            `\u000fDK${upper(transfer.sourceAccountName)}` +
            `\u000fEK${money(transfer.amount.transfer)}` +
            `\u000fFK${money(transfer.balance.available)}`,

        SELECT_ACCOUNT_TRANSFER: screenImage('070'), // screen for selecting recipient account
        SELECT_ACCOUNT: screenImage('066'), // screen for selecting own account
        SELECT_ACCOUNT_FROM: screenImage('100'), // screen for selecting transfer from account
        TXDENIED_TAKE_CARD: screenImage('011'), // screens showing that transaction was denied also shows 'take card' message
        TIA: screenImage('009'), // image to show during TIA

        ERR_CARD_INVALID: screenImage('041'), // screen to show when invalid error occurred when checking card and PIN
        ERR_UNKNOWN_CARD_ACCOUNT: screenImage('050'), // screen to show when card or linked account is not found/valid
        ERR_CARD_HOT: screenImage('051'), // screen to show when card with status 'hot' is captured
        ERR_CARD_DESTRUCTION: screenImage('051'), // screen to show when card with status 'for destruction' is captured
        ERR_CARD_NOT_ACTIVATED: screenImage('052'), // screen to show when card is not yet activated
        ERR_CARD_INACTIVE: screenImage('054'), // screen to show when card is deactivated
        ERR_CARD_INVALID_PIN_DATA: screenImage('056'), // screen to show when PIN data for card is not valid
        ERR_CARD_EXPIRED: screenImage('058'), // screen to show when card is expired
        ERR_CARD_EXCEED_RETRIES: screenImage('059'), // screen to show when PIN retries are exceeded
        ERR_TRANSACTION_CANCELLED: screenImage('062') // screen to show when transaction is cancelled due to invalid data
    },
    states: {
        SELECT_ACCOUNT: '092', // eight FDK state to select own account to be used for withdrawal
        SELECT_ACCOUNT_FROM: '118', // eight FDK state to select transfer from account
        SELECT_ACCOUNT_TRANSFER: '127', // eight FDK state to select destination account
        SELECT_ACCOUNT_TOPUP: '096', // eight FDK state to select own account to be used for topup
        SELECT_ACCOUNT_SMS: '111', // eight FDK state to select own account to be used for sms registration
        SELECT_AMOUNT_WITHDRAW: '025', // FDK selection state for choosing amount
        SELECT_TOPUP: '067', // FDK selection state for choosing topup company
        SELECT_BILL: '045', // FDK selection state for choosing bill payment company
        SELECT_TRANSFER: '046', // FDK selection state for choosing type of transfer

        TRANSACTION_SWITCH: '007', // FIT switch state that leads to transaction selection
        CONFIRM_RECEIPT_PRINT: '030', // FDK selection state for confirming receipt printing, which then leads to transaction request
        PRESET_TRANSACTION: '038', // state that sets the request as 'transaction posting' and leads to transaction request state
        PRESET_TRANSER_ACCOUNT_LIST: '080', // state that sets the request as 'transfer account list' and leads to transaction request state
        PRESET_ENTER_ACCOUNT: '061', // state that sets the request as 'enter account' and leads to transaction request state
        PRESET_ENTER_ACCOUNT_BILL: '065', // state that sets the request as 'enter bill account' and leads to transaction request state
        ENTER_TRANSFER_AMOUNT: '083', // amount entry state for entering transfer amount
        ENTER_AMOUNT_FORCE_RECEIPT: '087', // amount entry state, which does not lead to receipt confirmation state

        TXSUCCESS_PIN_CHANGED: '073', // state to enter after successful PIN entry
        TXSUCCESS_TAKE_CARD: ['078', '3'], // state to enter after successful card withdrawal
        TXSUCCESS_REQUEST_COUNTERS: ['125', 'A'],
        TXSUCCESS_TAKERECEIPT: '031', // state to enter after successful cardless withdrawal
        TXSUCCESS_CONFIRM_ANOTHER: '101', // state to enter after successful transfer
        TXSUCCESS_BALANCE: '055', // state to enter after successful balance enquiry
        TXSUCCESS_CHEQUEBOOK: '170', // state to enter after successful balance enquiry
        SUCCESS_GETACCOUNTS_BEMS: '156', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_TR: '157', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_WT: '158', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_TR_LD: '176', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_WT_LD: '177', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_TP: '166', // state to enter after successful fetch accounts
        SUCCESS_GETACCOUNTS_CB: '160', // state to enter after successful fetch accounts
        TXSUCCESS_MINISTATEMENT: '056', // state to enter after successful ministatement
        TXSUCCESS_TOPUP: '104', // state to enter after successful topup
        TXSUCCESS_BILL: '057', // state to enter after successful bill payment
        SMS_PULL: '107',
        SMS_PUSH: '108',

        ERR_CLOSE_WITH_MESSAGE: ['050','3'], // close state, suitable for showing error message coming from switch
        ERR_TRANS_CLOSE_WITH_MESSAGE: ['050','10'], // close state, suitable for showing error message coming from switch
        ERR_NO_PAPER: '088', // state to enter when receipt printer is out of paper and transaction is supposed to print important information
        ERR_INVALID_ACCTYPE: '035', // state to enter showing error message saying that selected account type is invalid, usually this state will allow to choose account type again
        ERR_INVALID_ACCTYPE_DEST: '079', // state to enter showing error message saying that selected destination account type is invalid, usually this state will allow to choose destination account type again
        ERR_INVALID_ACCOUNT_DEST: '060', // state to enter showing error message saying that selected destination account is invalid, usually this state will allow to choose destination account again
        ERR_INVALID_SECURITY_CODE: '062', // state to enter when invalid security code was entered for cardless withdrawal
        ERR_INVALID_CARDLESS_AMOUNT: '091', // state to enter when invalid amount was entered for cardless transfer
        ERR_INCORRECT_PIN: '015', // state to enter when invalid card PIN was entered
        ERR_NOTES_ZERO_AMOUNT: '024', // state to enter when zero amount was entered
        ERR_NOTES_INSUFFICIENT: '084', // state to enter when ATM has insufficient notes for transaction
        ERR_NOTES_OVERFLOW: '024', // state to enter when amount count of notes to dispense is too big
        ERR_NOTES_INVALID_AMOUNT: '024', // state to enter when amount cannot be dispensed with the available denominations
        ERR_SERVER_TIMEOUT: ['014', '3'], // state to enter when request timed out at switch side
        ERR_INSUFFICIENT_FUNDS: '058' // state to enter when account has insufficient funds
    },
    screenData: [
        'R00\u001bGLOGO1.GPH\u001b\\\u001b[024u',
        'R01\u001b(1',
        `C00${SHOW('060')}`,
        `C01${SHOW('076')}`,
        `C02${SHOW('077')}`,
        `C03${SHOW('078')}`,
        `C04${SHOW('079')}`,
        `C05${SHOW('077')}`,
        `C06${SHOW('081')}`,
        `000${SHOW('059')}`,
        `001${SHOW('001')}`,
        `002${SHOW('002')}\u000fFL\u001b[00m\u001b[27m\u001b[80m`,
        `003${SHOW('003')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `004${SHOW('004')}\u000fHL\u001b[00m\u001b[27m\u001b[80m`,
        `005${SHOW('005')}`,
        `006${SHOW('006')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `007${SHOW('007')}`,
        `008${SHOW('008')}\u001b[00m\u001b[27m\u001b[80m`,
        `009${SHOW('009')}`,
        `010${SHOW('010')}`,
        `011${SHOW('011')}`,
        `012${SHOW('012')}`,
        `013${SHOW('013')}`,
        `014${SHOW('014')}`,
        `015${SHOW('015')}\u000fHL\u001b[00m\u001b[27m\u001b[80m`,
        `016${SHOW('016')}`,
        `017\u000f@@\u001bPE${PATH}017${EXT}\u001b\\`,
        `018${SHOW('018')}`,
        `019${SHOW('019')}`,
        `020${SHOW('020')}`,
        `021${SHOW('021')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `022${SHOW('022')}\u000fOL\u001b[00m\u001b[27m\u001b[80m`,
        `023${SHOW('023')}\u001b[00m\u001b[27m\u001b[80m`,
        `024${SHOW('024')}`,
        `025${SHOW('025')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `026${SHOW('026')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `027${SHOW('027')}`,
        `028${SHOW('028')}`,
        `029${SHOW('029')}\u001b[00m\u001b[27m\u001b[80m`,
        `030${SHOW('030')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `031${SHOW('031')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `032${SHOW('032')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `033${SHOW('033')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `034${SHOW('034')}\u000fHL\u001b[00m\u001b[27m\u001b[80m`,
        `035${SHOW('035')}\u000fHL\u001b[00m\u001b[27m\u001b[80m`,
        `036${SHOW('036')}`,
        `037${SHOW('037')}`,
        `038${SHOW('038')}`,
        `039${SHOW('039')}\u000fHL\u001b[00m\u001b[27m\u001b[80m`,
        `040${SHOW('040')}\u000fFM\u001b[00m\u001b[27m\u001b[80m`,
        `041${SHOW('041')}`,
        `042${SHOW('042')}`,
        `043${SHOW('043')}`,
        `044${SHOW('044')}`,
        `045${SHOW('045')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `046${SHOW('046')}`,
        `047${SHOW('047')}`,
        `048${SHOW('048')}`,
        `049${SHOW('049')}`,
        `050${SHOW('050')}`,
        `051${SHOW('051')}`,
        `052${SHOW('052')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `053${SHOW('053')}`,
        `054${SHOW('054')}`,
        `055${SHOW('055')}`,
        `056${SHOW('056')}`,
        `057${SHOW('057')}`,
        `058${SHOW('058')}`,
        `059${SHOW('059')}`,
        `060${SHOW('060')}`,
        `061${SHOW('061')}`,
        `062${SHOW('062')}`,
        `063${SHOW('063')}`,
        `064${SHOW('064')}`,
        '065\u000fHF ** *** ***',
        `066${SHOW('066')}`,
        `067${SHOW('067')}`,
        '068\u000e012\u000e003',
        `069${SHOW('069')}`,
        `070${SHOW('070')}`,
        `071${SHOW('071')}`,
        '076\u000c\u001b(1\u000fG@\u001b[00m\u001b[27m\u001b[80m',
        '075\u000c',
        `077${SHOW('077')}`,
        `078${SHOW('078')}`,
        `079${SHOW('079')}`,
        `080${SHOW('080')}`,
        `081${SHOW('081')}`,
        `082${SHOW('082')}`,
        `083${SHOW('083')}`,
        `084${SHOW('084')}`,
        `085${SHOW('085')}`,
        '086\u000e017\u000e029',
        `087${SHOW('087')}`,
        `088${SHOW('010')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `089${SHOW('012')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `090${SHOW('011')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `091${SHOW('091')}`,
        `092${SHOW('092')}`,
        `093${SHOW('093')}`,
        `100${SHOW('100')}`,
        `101${SHOW('101')}`,
        `102${SHOW('102')}\u000fHK\u001b[00m\u001b[27m\u001b[80m`,
        `103${SHOW('103')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `104${SHOW('104')}`,
        `105${SHOW('105')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `106${SHOW('106')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `107${SHOW('107')}`,
        `108${SHOW('108')}`,
        `109${SHOW('109')}`,
        `119${SHOW('119')}`,
        `156${SHOW('156')}`,
        `158${SHOW('158')}`,
        `160${SHOW('160')}`,
        `161${SHOW('161')}`,
        //'164\u000c\u000fBFPLEASE SELECT EMV\u000fCIAPPLICATION',
        '165\u001b[27m\u001b[80m\u001b(1\u000fF4&&S&&RJ************&&E',
        '166\u001b[27m\u001b[80m\u001b(1\u000fI4&&S&&RJ************&&E',
        '167\u001b[27m\u001b[80m\u001b(1\u000fL4&&S&&RJ************&&E',
        // '   \u001b[27m\u001b[80m\u001b(1\u000fO4***********\u000f@@',
        // '   \u001b[27m\u001b[80m\u001b(1\u000fOA***********\u000f@@',
        '168\u001b[27m\u001b[80m\u001b(1\u000fLA&&S&&LJ************&&E',
        '169\u001b[27m\u001b[80m\u001b(1\u000fIA&&S&&LJ************&&E',
        '170\u001b[27m\u001b[80m\u001b(1\u000fFA&&S&&LJ************&&E',          
        `200${SHOW('259')}`,
        `201${SHOW('201')}`,
        `202${SHOW('202')}\u000fFL\u001b[00m\u001b[27m\u001b[80m`,
        `203${SHOW('203')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `204${SHOW('204')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `205${SHOW('005')}`,
        `206${SHOW('006')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `207${SHOW('007')}`,
        `208${SHOW('208')}\u001b[00m\u001b[27m\u001b[80m`,
        `209${SHOW('009')}`,
        `210${SHOW('010')}`,
        `211${SHOW('211')}`,
        `212${SHOW('212')}`,
        `213${SHOW('213')}`,
        `214${SHOW('214')}`,
        `215${SHOW('215')}\u000fFL\u001b[00m\u001b[27m\u001b[80m`,
        `216${SHOW('216')}`,
        `217\u000f@@\u001bPE${PATH}217${EXT}\u001b\\`,
        `218${SHOW('218')}`,
        `219${SHOW('219')}`,
        `220${SHOW('220')}`,
        `221${SHOW('221')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `222${SHOW('222')}\u000fFL\u001b[00m\u001b[27m\u001b[80m`,
        `223${SHOW('223')}\u001b[00m\u001b[27m\u001b[80m`,
        `224${SHOW('224')}`,
        `225${SHOW('025')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `226${SHOW('226')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `227${SHOW('227')}`,
        `228${SHOW('228')}`,
        `229${SHOW('229')}\u001b[00m\u001b[27m\u001b[80m`,
        `230${SHOW('230')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `231${SHOW('231')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `232${SHOW('232')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `233${SHOW('233')}\u000fGI\u001b[00m\u001b[27m\u001b[80m`,
        `234${SHOW('234')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `235${SHOW('235')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `236${SHOW('236')}`,
        `237${SHOW('237')}`,
        `238${SHOW('038')}`,
        `239${SHOW('239')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `240${SHOW('240')}\u000fFM\u001b[00m\u001b[27m\u001b[80m`,
        `241${SHOW('241')}`,
        `242${SHOW('242')}`,
        `243${SHOW('243')}\u001b[00m\u001b[27m\u001b[80m`,
        `244${SHOW('244')}`,
        `245${SHOW('245')}\u000fEJ\u001b[00m\u001b[27m\u001b[80m`,
        `246${SHOW('046')}`,
        `247${SHOW('247')}`,
        `248${SHOW('248')}`,
        `249${SHOW('249')}`,
        `250${SHOW('250')}`,
        `251${SHOW('251')}`,
        `252${SHOW('252')}\u000fFN\u001b[00m\u001b[27m\u001b[80m`,
        `253${SHOW('253')}`,
        `254${SHOW('254')}`,
        `255${SHOW('255')}`,
        `256${SHOW('256')}`,
        `257${SHOW('257')}`,
        `258${SHOW('258')}`,
        `259${SHOW('259')}`,
        `260${SHOW('260')}`,
        `261${SHOW('261')}`,
        `262${SHOW('262')}`,
        `263${SHOW('263')}`,
        `264${SHOW('264')}`,
        '265\u000fEFVT ** *** ***',
        `266${SHOW('066')}`,
        `267${SHOW('067')}`,
        '268\u000e212\u000e203',
        `269${SHOW('269')}`,
        `270${SHOW('270')}`,
        `271${SHOW('271')}`,
        '276\u000c\u001b(1\u000fG@\u001b[00m\u001b[27m\u001b[80m',
        '275\u000c',
        `277${SHOW('277')}`,
        `278${SHOW('278')}`,
        `279${SHOW('279')}`,
        `280${SHOW('280')}`,
        `281${SHOW('281')}`,
        `282${SHOW('282')}`,
        `283${SHOW('283')}`,
        `284${SHOW('284')}`,
        `285${SHOW('285')}`,
        '286\u000e217\u000e229',
        `287${SHOW('287')}`,
        `288${SHOW('210')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `289${SHOW('212')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `290${SHOW('211')}\u000fFD\u001b[00m\u001b[27m\u001b[80mUNABLE TO DISPENSE AMOUNT`,
        `291${SHOW('291')}`,
        `292${SHOW('292')}`,
        `293${SHOW('293')}`,
        `300${SHOW('300')}`,
        `301${SHOW('301')}`,
        `302${SHOW('302')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `303${SHOW('303')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `304${SHOW('304')}`,
        `305${SHOW('305')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `306${SHOW('306')}\u000fEK\u001b[00m\u001b[27m\u001b[80m`,
        `307${SHOW('307')}`,
        `308${SHOW('308')}`,
        `309${SHOW('309')}`
    ],
    stateData: [
        '000A001208064002008010001003',
		'001K005005005005037037037037',
		'002Z000000200000000000000000',
		'003K075076075075075075075075',
		'004Y037003003005255004006000',
		'005K006007006006006037037037',
		'006B004003003003003003117000',
        // '006B004075076008078041117050',
		'007D114001000000000000000000',
		'008D010255128000000000000255',
		'009E005003007255255025025005',
		'010I009014001000001000001000',
		'011H002003003085255255255002',
		'012Y006003003016255002195255',
		'013D018255000128000000000255',
		'014J038000038051000000000000',
		'015B039003003003003003008000',
		'016W148049043078163147147149',
		'018I009014001000001000000003',
		'021W030030022078030030030030',
		'022F008003025030025255255065',
		'023G030024000000002001003000',
		'024F043003025030255255255065',
		'025X007003007021026030255000',
		'026Z400500000000050100200300',
		'028D029255000000128000000255',
		'029I009014001000001000000000',
		'030Y010003007038255001024255',
		'031Y067003003109255000012000',
		'035Y040003003109255000012000',
		'037J041000041051000000000255',
		'038D206255000000000128000255',
		'039I009014001000001001001003',
		'040Z003000000016000000000000',
		'042X066003007052051020255000',
		'043Y018003007172255004192255',
		'044Y014003003038255001048255',
		'045Y019003003089255006235255',
		'046E024003007083083255255006',
		'047Y028003003090255006203255',
		'048Z003001000000000000000000',
		'049b034003003038003035045048',
        '050J075000075051075000000000',
		'051Z001002003004008007006005',
		'052D053255000000128000000255',
		'053I009014001000001000000003',
		'054W135049043255009139039039',
		'055Y046003003109255000024000',
		'056Y047003003109255000024000',
		'057Y048003003109255000012000',
		'058Y049003003109255000012000',
		'059H025003007255059083007003',
		'060H053003007255059061007003',
		'061D070255000000000000000077',
		'062H015076076255062085076002',
		'063D069255000000000000000064',
		'064Z000000128000000000000000',
		'065H022003003066255255255003',
		'066F023003065038255255255065',
		'067F029003007030255255255065',
		'068H002003003069255255255003',
		'069I009014001000001000000001',
		'070I009014001000001000000001',
		'071Y026003003109255000012000',
		'072Y032003003109255000012000',
		'073E036003003255255255124000',
		'074Y044003003109255000012000',
		'075J033000033051000000000255',
		'076J062000062062000000000255',
		'077Z128000000000000000000000',
		'078J081000081051000000000255',
		'079Y069003003109255000012000',
		'080D018255000000000000000081',
		'081Z000128000000000000000000',
		'082X070003007083051010255000',
		'083F023003003030255255255065',
		'084Y071003003109255000012000',
		'085D086255000000000008000000',
		'086F023003003030255255255065',
		'087F023003003038255255255065',
		'088Y082003003109255000012000',
		'089W065065065007065065065065',
		'090W067067067007067067067067',
		'091F043003003255255038003065',
		'092X066003003025051020001000',
		'093X066003003025051020003000',
		'094X066003003025051020007000',
		'095X066003003025051020015000',
		'096X066003003067051020001000',
		'097X066003003067051020003000',
		'098X066003003067051020007000',
		'099X066003003067051020015000',
		'100K012011012114037037037037',
		'101Y101003003109255000024000',
		'102H102003007103255255255001',
		'103H103003007013255255255003',
		'104Y104003003109255000024000',
		'105H105003007106255255255001',
		'106H106003007013255255255003',
		'107Y107003003109255000024000',
		'108Y108003003109255000024000',
		'109W124124007124007124124124',
		'110D039000000000000255000000',
		'111X066003003038051020003000',
		'112X066003003038051020007000',
		'113X066003003038051020015000',
		'114Y006003003016255002239000',
		'115E005003114255255030030005',
		'116E005003114255255046046005',
		'117K008008008141114114114114',
		'118X100003003080051020001000',
		'119X100003003080051020003000',
		'120X100003003080051020007000',
		'121X100003003080051020015000',
		'124J081000081051000000000255',
		'125D126000000000255000000000',
		'126I017014001000001000000001',
		'127X070003003083051010001000',
		'128X070003003083051010003000',
		'129X070003003083051010007000',
		'130X070003003083051010015000',
		'131X066003007030051020001000',
		'132X066003007030051020003000',
		'133X066003007030051020007000',
		'134X066003007030051020015000',
        '135E005003007255255136136005',
        '136X007003007137026030255000',
        '137W138138171078138138138138',
        '138H025003007255138030136003',
        '139E005003007255255030030005',
        '140X007003007021026030255000',
        '141Y119003003142255002015000',
         //'142W188139139185135135135135',
        '142W188260265185255255255255',
        '143E005003007255255136136005',
        '144Y037003003145255003192002',
        '145W009139135135135135135135',//Get the accounts linked to the currency
        '146I066014001000001001000003',
        '147Y037003003150255003003000',
        '148Y037003003151255003003000',
        '149Y037003003152255003003000',
        '150W153153255255255255255255',//After select currency, load the accounts linked to that currency
        '151W154154255255255255255255',//After select currency, load the accounts linked to that currency
        '152W155155255255255255255255',//After select currency, load the accounts linked to that currency   
        '153I156147001000001001000003',//Get accounts be and minstat
        '154I156148001000001001000003',//Get accounts transfer
        '155I156149001000001001000003',//Get accounts withdrawal and topup 
        '156E066003007255030030030005', 
        '157E066003007255136136136005',
        '158E066003007255025025025005', 
        '159I156043001000001001000003',//Get accounts for chequebook request  
        '160E066003007255038038038005',  
        '161Y037003003162255003003000', 
        '162W159159255255255255255255',
        '163Y037003003164255003003000',
        '164W165165255255255255255255',//After select currency, load the accounts linked to that currency
        '165I156163001000001001000003',//Get accounts withdrawal and topup 
        '166E066003007255255167167005',
        '167X007003007168026030255000', 
        '168W169169022003003169169169',
        '169H102003007255168030168003',
        '170Y067003003109255000024000',
        '171F008003025138025255255065',
		'172Y037003003173255003003000',
		'173W159159255255255255255255',//After select currency, load the accounts linked to that currency
		'174I009014001000001001129175',
        '175Z003000000255000000001000',
        '176E066003007255180180180005', //LD Transfers
        '177E066003007255178178178005', //LD withdrawal
        '178X158003007021179031255000',
        '179Z400500000000050100200300',
        '180X158003007137181031255000',
        '181Z400500000000050100200300',
        //'185b034003003038003035045186',
        '185b034003003270003035045186',
        '186Z003001000000000000000000',
        //'187E005003007255255188188005',
        '188Y037003003189255003003000',
        '189W190009255255255255255255',
        //'190E005003007255255178178005',
        '190E005003007255255275275005',
        '200+202001001001000000801000',
        '201,001001037037037037000000',
        '202/001000000203000000000000',
        '203Z204219220221222223224000',
        '204?001001001040040000000000',
        '205Z003000000000000000001000',
        '206?174001001031040000000000',
        '207Z003000000000000000001000',
		'208K200200209209037037037037',
        '209+245001001000000000000000', // + Begin ICC Initialisation
        '210/001000000211000000000000', // / Complete ICC Application Selection
        '211Z212037213214215216217001', // for no fallback to mag stripe set entry 9 to 000
        '212k000001000000000000001037', // k Smart FIT Check state
        '213J041000041051000000000255',
        '214J041000041051000000000255',
        '215J041000041051000000000255',
        '216J041000041051000000000255',
        '217J041000041051000000000255',
        '218J041000041051000000000255',
		'219?001001001040040000000000',
		'220?001001001040040000000000',
		'221?001001001040040000000000',
		'222?001001001040040000000000',
		'223?001001001040040000000000',
		'224?001001001040040000000000',
		'225?001001001040040000000000',
        '245,001246001250252253254000', // , Complete ICC Initialisation State
        '246.160247248249000000000000', // . Begin ICC Application Selection & Initialisation State
        '247Z165166167000000168169170',
        '248Z160004161005000000000000',
        '249Z037037210210037000000000',
        '250J041000041051000000000255',
        '251J041000041051000000000255',
        '252J041000041051000000000255',
        '253J041000041051000000000255',
        '254J041000041051000000000255',
        '260E005003007255255261261005',
        '261Y010003007262255001024255',
        '262D263255000000000128000255',
        '263?174001002040040000000000',
        '265E005003007255255266266005',
        '266Y010003007267255001024255',
        '267D268255000000000128000255',
        '268?174001003040040000000000',
        '270D271255000000000128000255',
        '271?174001004040040000000000',
        '275X158003007277276031255000',
        '276Z400500000000050100200300',	
        '277W279279278078279279279279',
        '278F008003275279275255255065',	
        '279Y010003007280255001024255',
        '280D281255000000000128000255',	
        '281?174002001031040000000000'
    ],
    fit: [
        '000000145050057255255000000132000015000013015255255001035069103137001035069000000000000000000000000000000000000000000000000002',
        '001000098114000255255043000136000015000013015255255001035069103137001035069000000000000000000000000000000000000000000000000002',
        '002000128003065001000003000136000015000013015255255001035069103137001035069000000000000000000000000000000000000000000000000002',
        '003000255255255255255003000136000015000013015255255001035069103137001035069000000000000000000000000000000000000000000000000002'
    ],
    emvCurrency: '020177095F2A0208405F3601020277095F2A0204305F360102',
    // emvTransaction: '020177079C01019F53015A1E77079C01309F53015A',
    emvTransaction: '040177039C01010277039C01300377039C01710477039C0192',
    emvLanguage: '01en000000104@@@',
    emvTerminal: '77099F1A0204309F350114',
    //emvApplication: ['0007A000000635101004VISACAM0000000100100000000A9F06575A5F349F279F269F10829F368C059F279F269F10959B000200'],
	emvApplication: ['0007A00000071901030Dliberia debitCAM0000000100100000001D8C9F029F03825A5F349F369F269F349F279F1E9F109F099F339F1A9F3595575F2A9A9F419B9C9F379F539F06505F205F24049B82959F1000010200',
                     '0107A00000000310100DVISA         CAM0096009600000000000C9F269F279F109F379F36959A9C9F025F2A829F1A01910107A0000000038010000200',
                     '0207A00000000380100DVisa PLUS    CAM0096009600000000000C9F269F279F109F379F36959A9C9F025F2A829F1A01910107A0000000031010000200',
                     '0307A00000000410100DMasterCard   CAM0002009600000000000F9F269F279F109F379F36959A9C9F025F2A829F1A5F349F338401910207A000000004600007A0000000043060000200',
                     '0407A00000000430600DMaestro      CAM0002009600000000000F9F269F279F109F379F36959A9C9F025F2A829F1A5F349F338401910207A000000004101007A0000000046000000200',
                     '0507A00000000460000DCirrus       CAM0002009600000000000F9F269F279F109F379F36959A9C9F025F2A829F1A5F349F338401910207A000000004306007A0000000041010000200',
                     '0608A0000003330101010FCUP DEBIT      CAM0020009600000000000C9F269F279F109F379F36959A9C9F025F2A829F1A01910108A000000333010102000200',
                     '0708A0000003330101020FCUP CREDIT     CAM0020009600000000000C9F269F279F109F379F36959A9C9F025F2A829F1A01910108A000000333010101000200',
                     '0807A00000077900000Dliberia debitCAM0000000100100000001D8C9F029F03825A5F349F369F269F349F279F1E9F109F099F339F1A9F3595575F2A9A9F419B9C9F379F539F06505F205F24049B82959F1000010200'],
    options: [
        '00002', // security camera off
        '01009', // ready state, buffer, supply mode
        '12001', // specific comand reject statuses
        '15001', // last transaction status
        '32007', // unsolicited reporting control
        '41001', // retract details
        '77001'  // cardless
    ],
    timers: [
        '00030',
        '01015',
        '02005',
        '03060',
        '07007',
        '10015'
    ],
    ejOptions: [
        '60', '900',
        '61', '000'
    ],
    ejTimer: [
        '60', '000'
    ],
    id: '0007',
    bill: {
        merchantA: '',
        merchantB: '',
        merchantC: ''
    },
    topup: {
        default: 'MTN',
        merchantA: '',
        merchantB: '',
        merchantC: ''
    },
    sms: {
        default: 'isims',
        merchantA: '',
        merchantB: '',
        merchantC: ''
    },withdraw: {
        default: '',
        issuer : 'tss',
        ledger : 'tss'
    },
    withdrawAcq: {
        default: '',
        issuer : 'cbl',
        ledger : 'cbl'
    },
     balanceAcq: {
        default: '',
        issuer : 'cbl',
        ledger : 'cbl'
    },
     transferAcq: {
        default: '',
        issuer : 'cbl',
        ledger : 'cbl'
    },
    withdrawExternalOwn: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
     balanceExternalOwn: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    ministatementExternalOwn: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    changePinExternalOwn: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    withdrawExternalNi: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
     balanceExternalNi: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    ministatementExternalNi: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    changePinExternalNi: {
        default: '',
        issuer : 'h2h',
        ledger : 'cbs'
    },
    chequebook: {
        default: 'lenga',
        issuer : 'lenga',
        ledger : 'lenga'
    },
    currencies: {
        LRD: '01'
    },
    validWithdrawAmount: (amount) => amount > 0,
    formatAmount: utils.formatAmount,
    receipts: {
        withdraw: require('./receipts/withdraw'),
        withdrawExternalNi: require('./receipts/withdraw'),
        withdrawExternalOwn: require('./receipts/withdraw'),
        balanceAcq: require('./receipts/balanceAcq'),
        balance: require('./receipts/balance'),
        balanceExternalOwn: require('./receipts/balance'),
        balanceExternalNi: require('./receipts/balance'),
        ministatement: require('./receipts/ministatement'),
        ministatementExternalOwn: require('./receipts/ministatement'),
        ministatementExternalNi: require('./receipts/ministatement'),
        transfer: require('./receipts/transfer'),
        topup: require('./receipts/topup'),
        bill: require('./receipts/bill'),
        transferOtp: require('./receipts/transferOtp'),
        withdrawOtp: require('./receipts/withdrawOtp'),
        error: require('./receipts/error'),
        tia: require('./receipts/tia'),
        journal: (transferId, sernum) => `TRN# ${transferId} SQN# ${sernum || 'N/A'}`,
        receipt: text => `\u001b[000p\u001b[040q\u001b(I${text}\u000c`
    },
    buffer: ({operations, errors}) => ({
        default: {currency: '', language: 0, mode: 'default', merchant: 'default', printReceipt: false},
        // map per buffer position, ABCDFGHI for button positions, X for fallback
        map: [{// 0            
            acqX: errors.badAccountType
        }, {// 1
            F: {printReceipt: true}
        }, {// 2
            X: errors.badTransaction,
            cardlessX: {txType: 'withdrawOtp'},
            ownA: {txType: 'transfer'},
            ownB: {txType: 'changePin', mode: 'ATM changepin'},
            ownC: {txType: 'chequebook'},
            ownG: {txType: 'ministatement'},
            ownH: {txType: 'balance'},
            ownI: {txType: 'withdraw'},
            ownF: {txType: 'topup'},
            acqA: {txType: 'withdrawAcq'},
            acqB: {txType: 'balanceAcq'},
            acqC: {txType: 'transferAcq'},
            externalOwnA: {txType: 'withdrawExternalOwn'},
            externalOwnB: {txType: 'balanceExternalOwn'},
            externalOwnC: {txType: 'ministatementExternalOwn'},
            externalOwnD: {txType: 'changePinExternalOwn', mode: 'ATM changepin'},
            externalNiA: {txType: 'withdrawExternalNi'},
            externalNiB: {txType: 'balanceExternalNi'},
            externalNiC: {txType: 'ministatementExternalNi'},
            externalNiD: {txType: 'changePinExternalNi', mode: 'ATM changepin'}
            
        }, {// 3
            X: {currency: 'LRD'},
            A : {currency: 'LRD'},
            B : {currency:'USD'}
        }, {// 4
            X: errors.badLanguage,
            H: {chequepages: '25Pages'},
            I: {chequepages: '50pages'},
            B: {language: 0},
            C: {language: 200}
        }, {// 5
            X: {accType: 'all'},
            //acqX: errors.badAccountType,
            acqD: {accType: 'current'},
            acqC: {accType: 'savings'},
            acqH: {accType: 'savings'},
            acqG: {accType: 'current'},
            externalOwnD: {accType: 'current'},
            externalOwnC: {accType: 'savings'},
            externalOwnH: {accType: 'savings'},
            externalOwnG: {accType: 'current'},
            externalNiD: {accType: 'current'},
            externalNiC: {accType: 'savings'},
            externalNiH: {accType: 'savings'},
            externalNiG: {accType: 'current'},
            ownD: {accType: '1'},
            ownC: {accType: '2'},
            ownB: {accType: '3'},
            ownF: {accType: '1'},
            ownG: {accType: '2'},
            ownH: {accType: '3'}
        }, {// 6
            A: {accType2: 'all', merchant: 'merchantA'},
            B: {accType2: 'all', merchant: 'merchantB'},
            C: {accType2: 'all', merchant: 'merchantC'},
            D: {accType2: 'all', merchant: 'merchantD'},
            F: {accType2: 'all', merchant: 'merchantF'},
            G: {accType2: 'all', merchant: 'merchantG'},
            H: {accType2: 'all', merchant: 'merchantH'},
            I: {accType2: 'all', merchant: 'merchantI'},
            acqX: errors.badAccountType,
            externalOwnX: errors.badAccountType,
            externalNiX: errors.badAccountType,
            acqA: {accType2: 'current'},
            acqB: {accType2: 'savings'},
            acqH: {accType2: 'savings'},
            acqI: {accType2: 'current'},
            externalOwnA: {accType2: 'current'},
            externalOwnB: {accType2: 'savings'},
            externalOwnH: {accType2: 'savings'},
            externalOwnI: {accType2: 'current'},
            externalNiA: {accType2: 'current'},
            externalNiB: {accType2: 'savings'},
            externalNiH: {accType2: 'savings'},
            externalNiI: {accType2: 'current'}
        }, {// 7
            X: errors.badRequestType,
            A: {operation: operations.checkPin, mode: 'ATM checkpin'},
            B: {operation: operations.accountList},
            C: {operation: operations.txSwitch},
            D: {operation: operations.txPost},
            F: {operation: operations.enterAccount},
            G: {operation: operations.accountListTransfer},
            H: {operation: operations.enterSecurityCode}
        }]
    }),
    accountsDisplay: accounts => {
        const XPOS = '@ABCDEFGHIJKLMNO0123456789:;<=>?'.split('');
        // const YPOS = '@ABCDEFGHIJKLMNO'.split('');
        const RIGHTFDK1 = ['E', 'H', 'K', 'N'];
        const RIGHTFDK2 = ['F', 'I', 'L', 'O'];

        function formatAmount(amount) {
            return amount + ' VT ';
        }

        const TRIM = 27;
        let maxLength = accounts.reduce((max, current) => {
            return [current.name && current.name.length, formatAmount(current.balance).length]
                .reduce((last, current) => ((current && (current > last)) ? current : last), max);
        }, 1);
        maxLength = maxLength > TRIM ? TRIM : maxLength;

        const startPos = XPOS[32 - maxLength];
        const pad = ' '.repeat(TRIM);
        const accountsDisplay = accounts.reduce((line, current, index) => {
            return line +
                '\u000f' + RIGHTFDK1[index] + startPos + (pad + (current.accountName || '').substring(0, maxLength)).slice(-maxLength)//.toLocaleUpperCase() +
                // '\u000f' + RIGHTFDK2[index] + startPos + (pad + formatAmount(current.availableBalance).substring(0, maxLength)).slice(-maxLength)
                // .toLocaleUpperCase();
        }, '\u001b[00;27;C2m');

        return {
            count: accounts.length,
            display: accountsDisplay
        };
    }
    
});