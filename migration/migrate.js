const fs = require('fs');

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

            record['created_at'] = Math.floor(Date.now() / 1000);
            record['object'] = key;

            // let object = {};
            // for(const i in record)
            //     object[i] = JSON.stringify([`${key}.${i}`, record[i]])

            // object['object'] = Buffer.from(JSON.stringify({ object: key })).toString('base64')

            // console.log(object);
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
        }
    }

    console.log(Date.now() - timestamp);
});
