require('../config');

exports.searchMetadata = async (req, res) => {
    const { query } = req.params;
    try {
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}metadata/?search=${query}`);
        let list = await response.json();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
