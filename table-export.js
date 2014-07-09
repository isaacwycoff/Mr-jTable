/*!
 * table exporter
 * currently exports to Microsoft-esque CSVs
 * 
 */
function table_export_csv(a, filename, tableClasses) {

	function parse_string_for_csv(input_string) {		
		// if there are double-quotes or commas in the string
		// we need to escape the quotes and surround the whole thing with quotes				
		output_string = input_string.replace(/"/g, "\"\"");			// escape quotes
		
		if (input_string.search("[\",]") != -1) {					// enclose in quotes
			output_string = "\"" + output_string + "\""	
		}		
		return output_string;				
	}		

	var cellArray = [];				// this will be a 2D array with all our data. need to do it this way to deal with rowspan
			
	var currentRowIndex = 0;
	var maxColumnCount = 0;
	
	tableClasses.forEach(function(tableClass) {

		tableElements = document.querySelectorAll('.' + tableClass);

		for(var t = 0; t < tableElements.length; t++) {			

			table = tableElements[t];
			
			var rowElements = table.querySelectorAll('tr');		

			for(var i = 0; i < rowElements.length; i++) {			
				var cellElements = rowElements[i].querySelectorAll('th, td');
			
				var columnCount = 0;
				var currentRow = [];
	
				if(currentRowIndex < cellArray.length) {				
					currentRow = cellArray[currentRowIndex];					
				}
				else {					
					currentRow = []
					cellArray.push(currentRow);
				}
			
				for(var j = 0; j < cellElements.length; j++) {
					element = cellElements[j];
	
					currentRow.push(parse_string_for_csv(element.innerHTML));
					
					colspan = parseInt(element.getAttribute('colspan')) || 1;
					rowspan = parseInt(element.getAttribute('rowspan')) || 1;
					
					columnCount += colspan;
					
					if (rowspan > 1 || colspan > 1) {
							
						var missingRows = currentRowIndex + rowspan - cellArray.length;
						
						for(; missingRows > 0; missingRows--) {							
							cellArray.push([]);
						}
						
						for(var spanRowIndex = currentRowIndex; spanRowIndex < currentRowIndex + rowspan; spanRowIndex++) {
	
							var missingColumns = spanRowIndex == currentRowIndex ? colspan - 1 : colspan;
							
							for (; missingColumns > 0; missingColumns--) {															
								cellArray[spanRowIndex].push('');
							}							
						}
					}					
				}
				if (columnCount > maxColumnCount) maxColumnCount = columnCount;			
				currentRowIndex++;			
			}							
			cellArray.push([]);		// add an empty line between sub-tables
			currentRowIndex++;			
		}
	});
	cellArray.pop();		// get rid of the last row, which is blank because of spacing between sub-tables.

	var csvString = '';						// this will store our CSV				
	cellArray.forEach(function(currentRow) {
		csvString += currentRow.join();			// convert into a comma-delimited string

		// some gross stuff to make sure that there are the same number of commas on each row
		// we need to add 1 comma less on empty rows, for reasons that are probably expressible mathemtically, but really annoying to do so.
		for (var missingColumns = maxColumnCount - (currentRow.length || 1); missingColumns > 0; missingColumns--) {				
			csvString += ',';			// fill out the rest of the row
		}		
		csvString += '\r\n';
	});

	// now turn it into a blob in local storage:
	var blob = new Blob([csvString], {type : 'text/csv'});
	
	var url = URL.createObjectURL(blob);		// get the URL to the blob
	
	// points the 'a' element at our generated file
	// this works because this function is called before the link is evaluated	
	a.setAttribute('href', url);
	a.setAttribute('download', filename);
	a.setAttribute('onclick', null);		
}
