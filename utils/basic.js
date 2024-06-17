
const json_encode = (object) => {
    let result = {}
    for(const key in object) {
        if(key == 'object')
            result[key] = Buffer.from(JSON.stringify({ object: object['object'] })).toString('base64');
        else
            result[key] = Buffer.from(JSON.stringify([`${object['object']}.${key}`, object[key]])).toString('base64');
    }
    return result;
}

const json_decode = (object) => {
    let result = {}
    for(const key in object) {
        if(key == 'object')
            result[key] = JSON.parse(Buffer.from(object[key], 'base64').toString('utf8'))['object'];
        else
            result[key] = JSON.parse(Buffer.from(object[key], 'base64').toString('utf8'))[1];
    }
    return result;
}

const orderByHandler = params => (a, b) => {
    for(const param of params) {
        if(a[param.key] > b[param.key])
            return param.order === 'ASC' ? 1 : -1;
        if(a[param.key] < b[param.key])
            return param.order === 'ASC' ? -1 : 1;
    }
    return 0;
}

const arrayMerge = async (connector, array1, array2) => {
    let response = {}
    const array = [...array1, ...array2]

    if(connector == "or")
        for(const key of array)
            response[key['id']] = key;
    else {
        for(const key of array1)
            response[key['id']] = true;
        for(const key of array2)
            if(response[key['id']])
                response[key['id']] = key;
    }
    return Object.values(response).filter(item => typeof item === 'object');
}

module.exports = { json_encode, json_decode, orderByHandler, arrayMerge };