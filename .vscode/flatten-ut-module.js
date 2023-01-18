var fs = require('fs');
var path = require('path');
const spawn = require('child_process').spawn;
var allRootModules = fs.readdirSync('./node_modules');
var ut = allRootModules.filter((dir) => (dir.startsWith('ut-')));
var nonUt = allRootModules.filter((dir) => (!dir.startsWith('ut-')));
ut.map((m) => {
    var moduleModulesDir = path.join('./node_modules', m, 'node_modules');
    var rmList = [];
    if (fs.existsSync(moduleModulesDir)) {
        fs.readdirSync(moduleModulesDir).map((subModule) => {
            var subModuleModulesDir = path.join(moduleModulesDir, subModule);
            if (~nonUt.indexOf(subModule)) {
                rmList.push(subModuleModulesDir);
                console.log(subModuleModulesDir);
                spawn('rm', ['-rf', subModuleModulesDir]);
            }
        });
        console.log('\n\n', 'rm -rf', rmList.join(' && rm -rf '));
    }
});
