module.exports = params => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:tws="http://schemas.datacontract.org/2004/07/TWSParser">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:WSEMSWGACCTBALTODAY>
         <tem:webRequestCommon>
            <tws:CompanyCode></tws:CompanyCode>
            <tws:Password>${params.pass}</tws:Password>
            <tws:UserName>${params.user}</tws:UserName>
         </tem:webRequestCommon>
         <tem:enquiryInput>
            <tws:EnquiryInputCollection>
               <tws:EnquiryInputCollection>
                  <tws:Field>ACCOUNT.NUMBER</tws:Field>
                  <tws:OperandValue>EQ</tws:OperandValue>
                  <tws:Value>${params.sourceAccount}</tws:Value>
               </tws:EnquiryInputCollection>
            </tws:EnquiryInputCollection>
         </tem:enquiryInput>
      </tem:WSEMSWGACCTBALTODAY>
   </soapenv:Body>
</soapenv:Envelope>`;
