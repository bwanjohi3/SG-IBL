function respCodeSgToNi(sgRC) {
    const mapping= {    
        '00': '00001', // Approved --> NI- Approved
        '01': '00068', // Refer to card issuer --> NI-ExternalDecline
        '02': '00075', // Refer to card issuer special condition --> NI-ExternalDeclineSpecial
        '03': '00056', // Invalid Source --> NI-IneligibleAcct
        '04': '00171', // Card Pick up --> NI-ContactIssuer
        '05': '00006', // Do Not Honor --> NI-Strong customer authentication required
        '06': '00054', // Error --> NI-System Error
        '07': '00171', // Pick up Card --> NI-ContactIssuer
        '13': '00067', // Not a valid amount --> NI-InvalidAmount
        '14': '00052', // Invalid card / Account Number --> NI-InvalidCard
        '17': '00004', // Cancelled --> NI-Postponed
        '18': '00082', // Dispute Transaction --> NI-InvalidTransaction
        '21': '00000', // No Action Taken --> NI-None
        '22': '00054', // Suspected Malfunction --> NI-System Error
        '25': '00054', // Record not found --> NI-System Error
        '26': '00054', // Duplicate Record --> NI-System Error
        '30': '00074', // Field Format Error --> NI-FormatError
        '31': '00056', // Unsupported Source --> NI-IneligibleAcct
        '33': '00051', // Expired Card --> NI-ExpiredCard
        '34': '00141', // Suspected Fraud Pick Up --> NI-NI-41 Stolen Card or 50 UnauthorizedUsage
        '39': '00064', // No Credit Account --> NI-CreditAmountLimit
        '40': '00057', // Unsupported transaction --> NI-TranNotSupported
        '41': '00140', // Lost Card Pick Up --> NI-Lost Card
        '51': '00059', // Insufficient Funds --> NI-InsufficientFunds
        '52': '00010', // No Check Account --> NI-Should Select Account Number
        '53': '00010', // No Savings Account --> NI-Should Select Account Number
        '57': '00055', // Transaction Not Permitted to card holder --> NI-IneligibleTran
        '58': '00054', // Unsupported terminal --> NI-System Error
        '59': '00041', // Suspected fraud --> NI-41 Stolen Card or 50 UnauthorizedUsage
        '61': '00063', // Withdrawal Limit exceeded --> NI-WithdrawalLimit
        '91': '00073', // Issuer Unavailable --> NI-RoutingError
        '96': '00054' // System Malfunction --> NI-System Error
    };
    if(mapping[sgRC]) {
        return mapping[sgRC]
    }
    return mapping['96'];
};

function respCodeNiToSg(niRC) {
    const retainCard = niRC.substr(2, 1);
    const rc = niRC.substr(3, 2);
    const mapping = {
        '00': '06', // None --> SG-Error
        '01': '00', // Approved --> SG-Approved
        '03': '01', // Purchase Only Approved --> SG-Refer to card issuer
        '04': '01', // Postponed --> Refer to card issuer
        '06': '05', // Strong customer authentication required --> SG-Do Not Honor
        '10': '14', // Should Select Account Number --> SG-Invalid card / Account Number
        '11': '06', // Should Change PVV --> SG-Error
        '13': '40', // Select Bill --> SG-Unsupported transaction
        '14': '05', // Customer Confirmation Requested --> SG-Do Not Honor
        '22': '06', // Acquirer Limit Exceeded --> SG-Error
        '40': '59', // Lost Card --> SG-G-Suspected Fraud !!!
        '41': '59', // Stolen Card --> SG-Suspected Fraud !!!
        '49': '03', // Ineligible Vendor Account --> SG-Invalid Source
        '50': '59', // UnauthorizedUsage --> SG-Suspected Fraud !!!
        '51': '33', // ExpiredCard --> SG-Expired Card
        '52': '14', // InvalidCard --> SG-Invalid card / Account Number
        '53': '05', // InvalidPin --> SG-Do Not Honor
        '55': '40', // IneligibleTran --> SG-Unsupported transaction
        '56': '31', // IneligibleAcct --> SG-Unsupported Source
        '57': '40', // TranNotSupported --> SG-Unsupported transaction
        '58': '14', // RestrictedCard --> SG-Invalid card / Account Number
        '59': '51', // InsufficientFunds --> SG-Insufficient Funds
        '60': '57', // UsesLimit --> SG-Transaction Not Permitted to card holder
        '61': '61', // WithdrawalWillLimit --> SG-Withdrawal Limit exceeded
        '62': '59', // PinTriesLimit --> SG-Suspected fraud
        '63': '61', // WithdrawalLimit --> SG-Withdrawal Limit exceeded
        '64': '57', // CreditAmountLimit --> SG-Transaction Not Permitted to card holder
        '65': '57', // NoStmtInfo --> SG-Transaction Not Permitted to card holder
        '66': '57', // StmtNotAvail --> SG-Transaction Not Permitted to card holder
        '67': '13', // InvalidAmount --> SG-Not a valid amount
        '68': '06', // ExternalDecline --> SG-Error
        '69': '96', // NoSharing --> SG-System Malfunction
        '71': '01', // ContactIssuer --> SG-Refer to card issuer
        '72': '96', // DestNotAvail --> SG-System Malfunction
        '73': '96', // RoutingError --> SG-System Malfunction
        '74': '30', // FormatError --> SG-Field Format Error
        '75': '06', // ExternalDeclineSpecial --> SG-Error
        '80': '06', // BadCVV --> SG-Error
        '81': '06', // BadCVV2 --> SG-Error
        '82': '40', // InvalidTransaction --> SG-Unsupported transaction
        '83': '06', // PinTriesWasExceeded --> SG-Error
        '97': '96', // RESP_INQUIRY_ONLY --> SG-System Malfunction
        '98': '96', // Invalid Merchant --> SG-System Malfunction
        '54': '96' // System Error --> SG-System Malfunction
    };
    if (retainCard == '1') {
        if (rc == '40') { 
            return '41'// Lost Card --> SG-Lost Card Pick Up
        } else if (rc == '41') {
            return '34' // Stolen Card --> SG-Suspected Fraud Pick Up
        } else if (rc == '50') {
            return '34'// UnauthorizedUsage --> SG-Suspected Fraud Pick Up
        } else { return '07'} // SG-Pick up Card
    } else if (mapping[rc]) {
        return mapping[rc];
    }
    return mapping['00'];
};
module.exports = {respCodeSgToNi, respCodeNiToSg};
