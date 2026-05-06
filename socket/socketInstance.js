let _io = null;

const setIO = (io) => { _io = io; };

const getIO = () => {
    if (!_io) {
        console.warn('[Socket] IO not initialized yet');
        return null;
    }
    return _io;
};

module.exports = { setIO, getIO };
