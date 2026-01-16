const fs = require("fs");

function readData(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
}

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };
