'use strict';
module.exports = params =>
`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:accu="http://temenos.com/ACCU_TWS_EE">
   <soapenv:Header/>
   <soapenv:Body>
      <accu:SIGNON>
         <WebRequestCommon>
            <password>${params.password}</password>
            <userName>${params.username}</userName>
        </WebRequestCommon>
         <PTTWSSIGNONType>
            <enquiryInputCollection>
               <columnName>USER.NAME</columnName>
               <criteriaValue>${params.username}</criteriaValue>
               <operand>EQ</operand>
            </enquiryInputCollection>
            <enquiryInputCollection>
               <columnName>USER.PASSWORD</columnName>
               <criteriaValue>${params.password}</criteriaValue>
               <operand>EQ</operand>
            </enquiryInputCollection>
         </PTTWSSIGNONType>
      </accu:SIGNON>
   </soapenv:Body>
</soapenv:Envelope>`;
