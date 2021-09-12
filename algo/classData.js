let Excel = require('exceljs');
let workbook = new Excel.Workbook();
const path = "test.csv";
workbook.xlsx.readFile(path)
    .then(() => {

    });

let convertTime = (intTime) => {
    const day = Math.floor(intTime / (24 * 60));
    intTime = intTime - 24 * 60 * day;
    const hour = Math.floor(intTime / 60);
    const minute = intTime - 60 * hour;
    return [day, hour, minute];
}
const sheet = workbook.addWorksheet('My Sheet');
// sheet.getCell('A1').value = convertTime(1900);
console.log(convertTime(1900));

workbook.xlsx.writeFile(path)
    .then(function() {
        // done 
    });