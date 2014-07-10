/*!
 * table exporter
 * currently exports to Microsoft-esque CSVs
 * 
 */
function table_export_csv(a, filename, selector) {
    // cells that are used up because of a rowspan or colspan are marked with
    // this special value (which is just an alias for null, but helps with readability)
	var USED_UP = null;

	function parse_string_for_csv(input_string) {		
		// if there are double-quotes or commas in the string
		// we need to escape the quotes and surround the whole thing with quotes				
		output_string = input_string.replace(/"/g, "\"\"");			// escape quotes
		output_string = output_string.replace(/(^\s+)|(\r?\n|\r)|(\s+)/g, "");		// remove newlines and all whitespace at beginning and end				
        // the value contains a comma, quote or a non printable character ASCII
        // character, so quote it				
		if (input_string.search(/[\",]|[^ -~]/) != -1) {					// enclose in quotes
			output_string = "\"" + output_string + "\""	
		}		
		return output_string;				
	}		

	tables = document.querySelectorAll(selector);

    // calculate the max number of cols across all the tables, and how many
    // rows the CSV will have
	var rows = 0;
	var columns = 0;
	for(var t = 0; t < tables.length; ++t) {			// can't use foreach with querySelector results
		table = tables[t];
		rows += table.rows.length;
        for(var i = 0; i < table.rows.length; ++i){
            columns = Math.max(table.rows[i].cells.length, columns);
        }
	}
    rows += tables.length - 1;    // we add a blank row between each table
    
    var cellArray = [];				// this will store our table before we stringify it
    for(var r = 0; r < rows; r++) {    	
    	cellArray.push(new Array(columns));
    }
	
	var rowIndex = columnIndex = 0;	
	for(var t = 0; t < tables.length; t++) {
		table = tables[t];		
		for(var i = 0; i < table.rows.length; ++i) {
			for(var j = 0, columnIndex = 0; j < table.rows[i].cells.length; ++j) {
				var element = table.rows[i].cells[j];
				
				while(cellArray[rowIndex][columnIndex] === USED_UP) { ++columnIndex; }
				
                var colspan = parseInt(element.getAttribute('colspan'), 10) || 1;
                var rowspan = parseInt(element.getAttribute('rowspan'), 10) || 1;
                // mark all the relevant cells as being used up because of the
                // colspan/rowspan
                for(var r = rowIndex; r < rowIndex + rowspan; r++){
                    for(var c = columnIndex; c < columnIndex + colspan; c++){
                        cellArray[r][c] = USED_UP;
                    }
                }

				// add the actual cell, but only if it's visible				
				var style = getComputedStyle(element, null);
				if(style.visibility == 'hidden' || style.display == 'none') {
					cellArray[rowIndex][columnIndex] = ''					
				}
				else {					
					cellArray[rowIndex][columnIndex] = parse_string_for_csv(element.textContent);					
				}
				++columnIndex;				
			}
			++rowIndex;
		}
		++rowIndex;		
	}
	
    // build a CSV string from the cellArray
    var csvRows = [];
    for(var r = 0; r < cellArray.length; r++){
        csvRows.push(cellArray[r].join(","));
    }
    csvString = csvRows.join("\r\n");
			
	var blob = new Blob([csvString], {type : 'text/csv'});		// now turn it into a blob in local storage
	var url = URL.createObjectURL(blob);		// get the URL to the blob
	
	// points the 'a' element at our generated file
	// this works because this function is called before the link is evaluated	
	a.setAttribute('href', url);
	a.setAttribute('download', filename); 
	a.setAttribute('onclick', null);	// turn off the onclick function so we don't repeatedly generate the CSV.
}
