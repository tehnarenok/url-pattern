export class InvalidParamsError extends Error {
    message = 'Invalid params for this pattern';
}

export class InvalidPathError extends Error {
    message = 'Path is not valid for this pattern';
}

export class DoubleParamError extends Error {
    message = 'Params cannot be repeated in the pattern';
}
