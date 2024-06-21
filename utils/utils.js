const { orderByHandler, arrayMerge } = require('./basic');
const { searchAssets } = require('./bigchaindb')

const whereHandlers = {
    '==' : operand => value => Object.keys(operand).every(key => operand[key] == value[key]),
    '=' : operand => value => Object.keys(operand).every(key => operand[key] == value[key]),
    'like' : operand => value => Object.keys(operand).every(key => value[key]?.includes(operand[key])),
    'not like' : operand => value => Object.keys(operand).every(key => !value[key]?.includes(operand[key])),
    '!=' : operand => value => !(Object.keys(operand).every(key => operand[key] == value[key])),
    'in' : operand => value => Object.keys(operand).every(key => operand[key]?.includes(value[key])),
    '!in' : operand => value => !(Object.keys(operand).every(key => operand[key]?.includes(value[key]))),
    'between' : operand => value => Object.keys(operand).every(key => value[key] >= operand[key][0] && value[key] <= operand[key][1]),
    '<' : operand => value => Object.keys(operand).every(key => operand[key] < value[key] ),
    '>' : operand => value => Object.keys(operand).every(key => operand[key] > value[key]),
    '<=' : operand => value => Object.keys(operand).every(key => operand[key] <= value[key] ),
    '>=' : operand => value => Object.keys(operand).every(key => operand[key] >= value[key]),
    '<>' : operand => value => !(Object.keys(operand).every(key => operand[key] == value[key])),
}

const querySolver = async (resource, where) => {
    if(!where) return resource
    if(where['operator']) {
        if(typeof resource == "object") {
            console.log('OPERATOR', where.operator);
            return resource.filter(whereHandlers[where.operator](where.operand));
        }

        switch(where['operator']) {
            case 'in':
                const [key, values] = Object.entries(where['operand'])[0];
                return await querySolver(resource, {
                    'connector': 'or',
                    'queries': values.map(value => ({
                        operator: '==',
                        operand: { [key]: value }
                    }))
                });

            case '==':
            case '=':
                const entries = Object.entries(where['operand']);
                const [field, value] = entries[0];
                const asset = await searchAssets(`${resource}.${field}`, value);

                if(entries.length == 1) return asset;
                
                return await querySolver(asset, {
                    connector: 'and',
                    queries: entries.slice(1).map(([key, value]) => ({
                        operator: '==',
                        operand: { [key]: value }
                    }))
                });       

            default:
                throw new Error('non booster detected');
        }
    }
    if(where['connector']) {
        const connector = where['connector'];
        let result = []
    
        // if(connector == 'or') {
            for(const query of where['queries']) {
                const asset = await querySolver(resource, query);

                if(!result.length) result = asset;
                else result = await arrayMerge(connector, result, asset);
            }
        // } else if(connector == 'and'){
        // }

        return result;
    }
    throw new Error('Where format incorrect');
}

const queryAsset = async (table, join, where, orderBy, page, limit) => {
    let tx_list = []

    const complexOperators = ['like', '!=', '!in', 'between'];
    const whereString = typeof where == "object" ? JSON.stringify(where) : where;

    if(join) {
        let [subTable, joinId, subJoinId] = join;
        joinId = joinId.slice(joinId.indexOf('.') + 1);
        subJoinId = subJoinId.slice(subJoinId.indexOf('.') + 1);

        const parents = await searchAssets('object', table);
        const children = await searchAssets('object', subTable);
        
        for(let parent of parents)
            for(let child of children)
                if(parent[joinId] == child[subJoinId]) {
                    let obj = {}
                    for(const key in parent)
                        obj[`${table}.${key}`] = parent[key]
                    for(const key in child)
                        obj[`${subTable}.${key}`] = child[key]
                    tx_list.push(obj)
                }
        tx_list = await querySolver(tx_list, where);
    }
    else if(!where || complexOperators.some(item => whereString.includes(`{"operator":"${item}","operand":{`)))
        tx_list = await querySolver(await searchAssets('object', table), where);
    else 
        tx_list = await querySolver(table, where);

    if(!tx_list.length) return {
        data: tx_list,
        total: 0
    }        

    if(orderBy && orderBy.length)
        tx_list.sort(orderByHandler(orderBy));

    let offset = 0, count = tx_list.length;
    if(page) 
        offset = (page - 1) * limit;
    if(limit)
        tx_list = tx_list.slice(offset, offset+limit);

    if(join) {
        let list = {}

        let subTable = join[0];

        for(const tx of tx_list) {
            let parent = {}, child = {};
            for(const key in tx) {
                if(key.includes(table))
                    parent[key.slice(key.indexOf('.') + 1)] = tx[key];
                else if(key.includes(subTable))
                    child[key.slice(key.indexOf('.') + 1)] = tx[key];
            }
            if(list[parent.id])
                list[parent.id].push(child);
            else
                list[parent.id] = { ...parent, [subTable]: [child]}
        }

        tx_list = Object.values(list);
    }

    return {
        data: tx_list,
        total: count
    };
}

module.exports = { queryAsset };