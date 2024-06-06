const API_PATH = 'http://172.104.249.201:9984/api/v1/';

exports.searchAssets = async (req, res) => {
    const { query } = req.params;
    try {
        let response = await fetch(`${API_PATH}assets/?search=${query}`);
        let list = await response.json();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
