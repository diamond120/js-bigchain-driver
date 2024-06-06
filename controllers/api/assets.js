const { searchAssets } = require('../../utils/bigchaindb')

exports.searchAssets = async (req, res) => {
    const { query } = req.params;
    try {
        const list = await searchAssets(query)
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
