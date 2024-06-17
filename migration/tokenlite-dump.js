const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const MYSQL_DATABASE = 'tokenlite'
const MYSQL_HOST = '127.0.0.1'
const MYSQL_USER = 'root'
const MYSQL_PASSWORD = 'password'
const TABLE_NAME = ['activities', 'email_templates', 'global_metas', 'ico_metas', 'ico_stages', 'kycs', 'languages', 'migrations', 'pages', 'password_resets', 'payment_methods', 'referrals', 'settings', 'transactions', 'translates', 'users', 'user_metas']

const joinHandler = {
    'global_metas': [
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'pid',
        },
    ],
    'ico_metas': [
        {
            "table": 'ico_stages',
            'field_from': 'uid',
            'field_to': 'stage_id',
        },
    ],
    'kycs': [
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'userId',
        },
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'reviewedBy',
        },
    ],
    'transactions': [
        {
            "table": 'users',
            'field_from': 'email',
            'field_to': 'payment_to',
        },
        {
            "table": 'ico_stages',
            'field_from': 'uid',
            'field_to': 'stage',
        },
    ],
    'user_metas': [
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'userId',
        },
    ],
    'activities': [
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'user_id',
        },
    ],
    'users': [
        {
            "table": 'users',
            'field_from': 'uid',
            'field_to': 'referral',
        },
    ],
}

// Setup MySQL connection
const mysqlConnection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
});

mysqlConnection.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL!");
});

let data = {}

for (const key in TABLE_NAME) {
    let tableName = TABLE_NAME[key];


    mysqlConnection.query(`SELECT * FROM ${tableName}`, async (err, result) => {
        if (err) throw err;
        let array = [];
        
        for(let record of result) {
            let temp = record;
            
            temp['uid'] = temp['id'];
            temp['id'] = uuidv4();
            array.push(temp);
        }

        data[tableName] = array;
    })

    // mysqlConnection.query(`SHOW COLUMNS FROM ${tableName}`, (err, results) => {
    //     if (err) throw err;
    //     const columnName = results.map((result) => {
    //         let type = result.Type
    //         if (type.includes('int') || type.includes('double')) type = 'Number'
    //         if (type.includes('char') || type.includes('text') || type.includes('enum')) type = 'String'
    //         if (type.includes('time')) type = 'Date'
    //         return { field: result.Field, type: type }
    //     })
    //     // console.log(columnName)

    //     let schemaObj = {}
    //     for (let i = 0; i < columnName.length; i++) {
    //         schemaObj[columnName[i].field] = columnName[i].type == 'Number' ? Number : columnName[i].type == 'String' ? String : Date
    //     }
    //     const schema = new mongoose.Schema(schemaObj)
    //     const model = mongoose.model(tableName, schema)

    //     for (let i = 0; i < record.length; i++) {
    //         const newData = new model(record[i])

    //         newData.save().then(console.log(`${tableName} saved successfully`))
    //     }
    // })
}

const getUidFromId = (hd, value) => {
    const tableData = data[hd.table];
    for(const i in tableData) {
        if(tableData[i][hd.field_from] == value)
            return tableData[i][hd.field_from == 'uid' ? 'id' : hd.field_from ];
    }
    return "xxx"
}

// Close MySQL connection
mysqlConnection.end((err) => {
    if (err) throw err;
    console.log('MySQL connection closed');

    for(const tableName in joinHandler) {
        const handler = joinHandler[tableName];

        for(const i in handler) {
            for(const j in data[tableName]) {
                // console.log(data[tableName][j][handler[i].field_to]);
                data[tableName][j][handler[i].field_to] = getUidFromId(handler[i], data[tableName][j][handler[i].field_to])
                // console.log(data[tableName][j][handler[i].field_to]);
            }
        }
    }


    // for(const tableName in data) {
    //     const handler = joinHandler[tableName];

    //     if(handler) {
    //         for(const i in data[tableName]) {
    //             for(const j in handler) {
    //                 data[tableName][i][handler[j].field_to] = getUidFromId(handler[j].field_from, data[tableName][i][handler[j].field_to], data[handler[j]['table']]);
    //             }
    //         }
    //     }
    // }
    
    let jsonData = JSON.stringify(data);
    fs.writeFileSync('data.json', jsonData);
});