/* eslint no-console:0 */
var bitsyntax = require('ut-bitsyntax');

// var buf = new Buffer('303230303732334134343131323841303930303031363633363136303530303030303731323033303130303030303030303030303030303031303231303631303139343734303333303631303139313032313130323136303131303231443030303030303030313136323732303030303030303239363336313630353030303030373132303D32323031313031303030303037363537202020202020202056414E41544D3035434F4D505554455220574F524C44202020202020202020504F52542056494C41202020202020565535343845454534423232364343364636423044');
var buf = new Buffer('02006230000120C01010164000000000000002960000121623163700000123163712160806637079374000000000000002000000000000000000000000000000000000000000000000000000000000000000');
console.log(buf);
var b1 = bitsyntax.matcher('s:8/string-hex, bmp:32/string-hex, rest/binary');
console.log(b1(buf));
