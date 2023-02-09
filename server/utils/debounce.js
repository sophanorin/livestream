function debounce(func, wait = 500) {
    let timeout;
    return function (...args) {
        const context = this;
        const later = function () {
            timeout = null;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

module.exports = { debounce };
