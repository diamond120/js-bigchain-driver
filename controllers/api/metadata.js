const { searchMetadata } = require('../../utils/bigchaindb')

exports.searchMetadata = async (req, res) => {
    const { query } = req.params;
    try {
        const list = await searchMetadata(query)
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
