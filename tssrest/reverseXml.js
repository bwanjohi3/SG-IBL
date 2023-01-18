'use strict';
module.exports = params => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:tws="http://schemas.datacontract.org/2004/07/TWSParser">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:WSPTENQLOCTRANSACTION>
         <!--Optional:-->
         <tem:webRequestCommon>
            <!--Optional:-->
            <tws:CompanyCode></tws:CompanyCode>
            <!--Optional:-->
            <tws:Password>${params.pass}</tws:Password>
            <!--Optional:-->
            <tws:UserName>${params.user}</tws:UserName>
         </tem:webRequestCommon>
         <!--Optional:-->
         <tem:enquiryInput>
            <!--Optional:-->
            <tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <!--Optional:-->
                  <tws:Field>TRANS.REF</tws:Field>
                  <!--Optional:-->
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <!--Optional:-->
                  <tws:Value>${params.transferId}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <!--Optional:-->
                  <tws:Field>BALANCE</tws:Field>
                  <!--Optional:-->
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <!--Optional:-->
                  <tws:Value>${params.sourceAccount}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <!--Optional:-->
                  <tws:Field>REVERSE</tws:Field>
                  <!--Optional:-->
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <!--Optional:-->
                  <tws:Value>Y</tws:Value>
               </tws:EnquiryInputCollection>
            </tws:EnquiryInputCollection>
         </tem:enquiryInput>
      </tem:WSPTENQLOCTRANSACTION>
   </soapenv:Body>
</soapenv:Envelope>`;
