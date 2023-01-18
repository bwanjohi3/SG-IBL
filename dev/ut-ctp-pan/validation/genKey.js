'use strict';
var joi = require('joi');

module.exports = {
    description: 'generate key',
    notes: ['generate key'],
    tags: ['pan', 'generate', 'key'],
    params: joi.object({
        mode: joi.string().allow(['0', '1', 'A', 'B']).required().description('0: Generate key; 1: Generate key and encrypt under ZMK (or TMK)'),
        keyType: joi.string().allow(['000', '001', '002', '003', '006', '008', '009', '00A', '00B', '00C', '00D', '100', '104', '105', '106', '109', '10C', '200', '204', '205', '206', '209', '305', '306', '309', '402', '405', '406', '409', '505', '506', '509', '605', '606', '705', '709', '805', '905']).required().description('000 Zone Master Key, ZMK; 200 Visacash Master Key, KML; 001 Zone PIN encryption, ZPK; 002 PIN Verification Key, PVK; 002 Terminal Master Key, TMK; 002 Terminal PIN Key, TPK; 402 Card Verification Key, CVK; 402 Card Verification Key, CSCK; 003 Terminal Authentication Key, TAK; 006 Watchword key, WWK; 008 Zone authentication key, ZAK; 009 DUKPT base key, BDK; 109 EMV Key, MK-AC; 209 EMV Key, MK-SMI; 309 EMV Key, MK-SMC; 409 EMV Key, MK-DAC; 509 EMV Key, MK-DN; 709 dCVV Master Key, MK-CVC3; 00A Data Encryption Key, ZEK; 00B Data Encryption Key, DEK; 104 DTAB; 204 IPB; 105 KML; 205 KMX; 305 KMP; 405 KIS,5\'; 505 KM3L|KM3LISS; 605 KM3X|KM3XISS; 705 KMACS4; 805 KMACS5; 905 KMACACQ; 106 KMACUPD; 206 KMACMA; 306 KMACCI|KMACISS; 406 KMSCISS; 506 BKEM; 606 BKAM; 00C RSA-SK; 10C HMAC; 00D RSA-MAC;'),
        keyScheme: joi.string().allow(['Z', 'U', 'T', 'X', 'Y', 'V', 'R', 'S']).required().description('Z single length DES key using ANSI X9.17 methods;U double length DES key using the variant method;T triple length DES key using the variant method;X double length key using ANSI X9.17 methods;Y triple length key using ANSI X9.17 methods;V using Verifone/GISKE methods;R using X9 TR-31 KeyBlock methods;S DES, RSA & HMAC keys using Thales KeyBlock methods'),
        keyZmkTmkFlag: joi
            .when('mode', {is: '1', then: joi.string().allow(0, 1, '0', '1').required()})
            .when('mode', {is: 'B', then: joi.string().allow(0, 1, '0', '1').required()})
            .description('0 : ZMK (default value if these fields are not present), 1 : TMK'),
            // .forbidden() otherwise ???
        keyZmkTmk: joi
            .when('mode', {is: '1', then: joi.string().regex(/^U[a-f0-9]{32}$/i).required()})
            .when('mode', {is: 'B', then: joi.string().regex(/^U[a-f0-9]{32}$/i).required()})
            .description('The Zone Master Key (or Terminal Master Key). For a ZMK, the length of the key must correspond to the ZMK key length as defined in the Security Settings'),
            // .forbidden() otherwise ???
        keyScheme1: joi
            .when('mode', {is: '1', then: joi.string().allow(['Z', 'U', 'T', 'X', 'Y', 'V', 'R', 'S']).required()})
            .when('mode', {is: 'B', then: joi.string().allow(['Z', 'U', 'T', 'X', 'Y', 'V', 'R', 'S']).required()})
            .description('Z single length DES key using ANSI X9.17 methods;U double length DES key using the variant method;T triple length DES key using the variant method;X double length key using ANSI X9.17 methods;Y triple length key using ANSI X9.17 methods;V using Verifone/GISKE methods;R using X9 TR-31 KeyBlock methods;S DES, RSA & HMAC keys using Thales KeyBlock methods'),
            // .forbidden() otherwise ???
        cipher: joi.string().required().description('encryption algorithm')
    }),
    response: joi.any(),
    auth: false
};
