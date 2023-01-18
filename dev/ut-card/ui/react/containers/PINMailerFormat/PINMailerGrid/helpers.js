export function mailerSizeValidator(value, step) {
    if (!value || !step) {
        return {
            isValid: true
        };
    }
    if (isNaN(value)) {
        return {
            isValid: false,
            errorMessage: 'Should be a number'
        };
    }
    let numberParts = ((value * 10) / (step * 10)).toString().split('.');
    if (!numberParts[1]) {
        return {
            isValid: true
        };
    } else {
        return {
            isValid: false,
            errorMessage: 'Step is ' + step.toString()
        };
    }
}

export function selectedFieldValidator(gridRow, startIndex, length, lastIndex) {
    let result = {
        isValid: true
    };
    let existingData = Object.keys(gridRow || {}).filter((value) => {
        return parseInt(value) >= startIndex && parseInt(value) < startIndex + length;
    });
    if (startIndex + length > lastIndex) {
        existingData.push({
            outOfPaper: true
        });
    }
    if (existingData.length > 0) {
        result = {
            isValid: false,
            errorMessage: 'Selection does not fit'
        };
    }
    return result;
}
