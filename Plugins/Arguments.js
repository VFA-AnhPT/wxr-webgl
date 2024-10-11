const Arguments = {
    _config: null,

    setConfig: (config) => {
        _config = config;
    },

    getValue: (key) => {
        if (_config === null) return null;
        return _config[key];
    }
};
