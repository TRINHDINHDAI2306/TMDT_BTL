const path = require('path');


const isValidImageExtension = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(fileName).toLowerCase();
    return imageExtensions.includes(ext);
};

module.exports = {
    isValidImageExtension
}