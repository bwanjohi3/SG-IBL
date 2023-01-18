'use strict';
const childProcess = require('child_process');
const managerShutdownExe = 'C:\\Program Files\\Diebold\\Agilis EmPower\\Bin\\Diebold.Agilis.EmPower.Management.ManagerShutdown.exe';
module.exports = {
    restartMachine: () => childProcess.execFileSync(managerShutdownExe, ['-r'])
};
