module.exports = (defineError) => {
    var Pos = defineError('pos');

    return {
        pos: Pos,
        duplicateTerminalId: defineError('duplicateTerminalId', Pos, 'Duplicate Terminal Id')
    };
};
