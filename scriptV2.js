console.log("JSON Parser by Pavel Limarenko - V2.0!");

const sheetId = "1t1bveuMPVhGsz4tKbhGbcIGhQjk9UbInuxsQiH1wxyM";
const sheetName = encodeURIComponent("Balance");
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
var csvInput = "string";
var outputPath = "d:/output_file.json";

fetch(sheetURL)
  .then((response) => response.text())
  .then((csvString) => handleResponse(csvString));


// Беру массив в виде колонки: Дата, CIS, EU, UK
function GetArrayColumn(array, columnNumber){
    var newArray = [];
    for(var i = 0; i < array.length; i++){
		newArray.push(array[i][columnNumber]);
    };
	newArray.push("");	// чтобы закидывать i за пределы диапазона массива
	newArray.push("");
	newArray.push("");
    return newArray;
}



function handleResponse(csvString) {

	var newcsvString = 	csvString;	
	// Различаем запятую внутри ячейки и запятую в роли разделителя
	newcsvString = newcsvString.replace(/","/g, "tempexpression1")
	newcsvString = newcsvString.replace(/,/g, "&&&")		
	newcsvString = newcsvString.replace(/tempexpression1/g, '","')
	newcsvString = newcsvString.replace(/"/g, '')
	

	const csvArray = newcsvString.split('\n').map(line => line.split(','));
	var newCsvArray = csvArray;
	
	const dateArr = GetArrayColumn(csvArray,0);	// Массивы с данными из колонок
	const cisArr = GetArrayColumn(csvArray,1);	
	const euArr = GetArrayColumn(csvArray,2);		  
	const ukArr = GetArrayColumn(csvArray,3);		  

	const balanceTypeArr = ["Gacha_Base", "Gacha_Rare", "RouletteBase", "RouletteEpic"];
	var outputCIS = []; // Выводим сюда данные по CIS
	var outputEU = [];
	var outputUK = [];
	var outputСount = 0; // Счетчик для массива (outputCIS, outputEU и пр.)
	
	// outputCIS - сюда помещаются все элементы строки JSON для CIS
	for(var btype = 0; btype < balanceTypeArr.length; btype++){	
		var bFirstEncounter = true;
		for(var i = 0; i < cisArr.length; i++){
			if (cisArr[i].includes(balanceTypeArr[btype]) && bFirstEncounter) {
				outputCIS[outputСount] = '    {';
				outputCIS[outputСount+3] = '      "balance": "' + balanceTypeArr[btype] + '"';
				outputCIS[outputСount+4] = '    },';
				outputCIS[outputСount+1] = '      "start_date": "' + dateArr[i] + '",';
				bFirstEncounter = false;
			}
			else if (cisArr[i].includes(balanceTypeArr[btype]) && !bFirstEncounter) {
				if (!cisArr[i+1].includes(balanceTypeArr[btype])) {
				outputCIS[outputСount+2] = '      "end_date": "' + dateArr[i] + '",';
				outputСount+=5;
				}
			}
		}
	}
	outputCIS[outputСount] = 'regionEnd\n';
		
	outputСount = 0; // обнулили счетчик для массива (outputCIS, outputEU и пр.)
		  
	// outputEU - сюда помещаются все элементы строки JSON для EU
	for(var btype = 0; btype < balanceTypeArr.length; btype++){	
		var bFirstEncounter = true;
		for(var i = 0; i < euArr.length; i++){
			if (euArr[i].includes(balanceTypeArr[btype]) && bFirstEncounter) {
				outputEU[outputСount] = '    {';
				outputEU[outputСount+3] = '      "balance": "' + balanceTypeArr[btype] + '"';
				outputEU[outputСount+4] = '    },';
				outputEU[outputСount+1] = '      "start_date": "' + dateArr[i] + '",';
				bFirstEncounter = false;
			}
			else if (euArr[i].includes(balanceTypeArr[btype]) && !bFirstEncounter) {
				if (!euArr[i+1].includes(balanceTypeArr[btype])) {
				outputEU[outputСount+2] = '      "end_date": "' + dateArr[i] + '",';
				outputСount+=5;
				}
			}
		}
	}
	outputEU[outputСount] = 'regionEnd\n';

	outputСount = 0; // обнулили счетчик для массива (outputCIS, outputEU и пр.)
		  
	// outputUK - сюда помещаются все элементы строки JSON для UK
	for(var btype = 0; btype < balanceTypeArr.length; btype++){	
		var bFirstEncounter = true;
		for(var i = 0; i < ukArr.length; i++){
			if (ukArr[i].includes(balanceTypeArr[btype]) && bFirstEncounter) {
				outputUK[outputСount] = '    {';
				outputUK[outputСount+3] = '      "balance": "' + balanceTypeArr[btype] + '"';
				outputUK[outputСount+4] = '    },';
				outputUK[outputСount+1] = '      "start_date": "' + dateArr[i] + '",';
				bFirstEncounter = false;
			}
			else if (ukArr[i].includes(balanceTypeArr[btype]) && !bFirstEncounter) {
				if (!ukArr[i+1].includes(balanceTypeArr[btype])) {
				outputUK[outputСount+2] = '      "end_date": "' + dateArr[i] + '",';
				outputСount+=5;
				}
			}
		}
	}
	outputUK[outputСount] = 'regionEnd\n';

	outputСount = 0; // обнулили счетчик для массива (outputCIS, outputEU и пр.)
	
	// Превратили массивы в текст
	var outputUKstring = outputUK.join('\n');
	var outputEUstring = outputEU.join('\n');
	var outputCISstring = outputCIS.join('\n');


	// Завершаем сборку JSON конфига
	var jsonHeader = '{\n';
	var jsonFooter = '}';
	var cisHeader = '  "CIS_Balance": [\n';
	var euHeader = '  "EU_Balance": [\n';
	var ukHeader = '  "UK_Balance": [\n';	
	var cisFooter = '  ],\n'; //одинаковый для всех
	var outputContent = jsonHeader + cisHeader + outputCISstring + cisFooter + euHeader + outputEUstring + cisFooter + ukHeader + outputUKstring + cisFooter + jsonFooter;
	var outputContent = outputContent.replaceAll(',\nregionEnd','');
	var outputContent = outputContent.replaceAll('],\n}',']\n}');

	console.log("------------------FINAL JSON CONFIG---------------------");
	console.log(outputContent);

	// Пишем файл на диск
	const fs = require('node:fs');

	fs.writeFile(outputPath, outputContent, err => {
	  if (err) {
		console.error(err);
	  } else {
		// file written successfully
	  }
	});

}
