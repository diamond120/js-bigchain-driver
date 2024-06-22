const fs = require('fs');
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

fs.readFile('robotbulls.json', 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    const jsonData = JSON.parse(data);

    let timestamp = Date.now();
  
    for (const key in jsonData) {
        let table = jsonData[key]

        for(let record of table) {
            delete record['uid'];
            delete record['updated_at'];

            record['created_at'] = Date.now();
            record['object'] = key;

            // let object = {};
            // for(const i in record)
            //     object[i] = JSON.stringify([`${key}.${i}`, record[i]])

            // object['object'] = Buffer.from(JSON.stringify({ object: key })).toString('base64')

            console.log(JSON.stringify(record));
            // console.log(record)

            const response = await fetch('http://localhost:2466/api/transactions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "data": record,
                    "metadata": null
                }),
            })
            console.log(await response.json());
            await delay(100);
        }
    }

    console.log(Date.now() - timestamp);
});
