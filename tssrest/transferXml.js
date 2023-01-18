module.exports = params => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:tws="http://schemas.datacontract.org/2004/07/TWSParser">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:WSPTENQLOCTRANSACTION>
         <tem:webRequestCommon>
            <tws:CompanyCode></tws:CompanyCode>
            <tws:Password>${params.password}</tws:Password>
            <tws:UserName>${params.username}</tws:UserName>
         </tem:webRequestCommon>
         <tem:enquiryInput>
            <tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>TRANS.TYPE</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.transferT24Type}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>TRANS.REF</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.transferId}</tws:Value>
               </tws:EnquiryInputCollection>
              <tws:EnquiryInputCollection>
                  <tws:Field>ACCOUNT.DR</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.sourceAccount}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>ACCOUNT.CR</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.destinationAccount || '*'}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>AMOUNT</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.transferAmount}</tws:Value>
               </tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>BALANCE</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.sourceAccount}</tws:Value>
               </tws:EnquiryInputCollection>
            </tws:EnquiryInputCollection>
         </tem:enquiryInput>
      </tem:WSPTENQLOCTRANSACTION>
   </soapenv:Body>
</soapenv:Envelope>`;
