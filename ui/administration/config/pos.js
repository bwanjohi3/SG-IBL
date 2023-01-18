export const posConfig = {
    pos: {
        terminals: {
            grid: {
                vissibleFields: ['terminalNumber', 'name', 'terminalSerial', 'merchantName', 'currVersion', 'newVersion']
            }
        },
    applications: {
            grid: {
                vissibleFields: ['name', 'version', 'description']
            }
        },
        binList:  {
            grid: {
                vissibleFields: ['binListId', 'transaction', 'description', 'productName']
            }
        }
    }
};
