dbSlayer = {
	baseUrl: (window.siqqelBaseUrl ? window.siqqelBaseUrl : '') + 'passthru.php',
	
	query: function(sqlQuery, hashParams, serverId, successCallback, errorCallback) {
		var sendHashParams = {};

		var missingHashParameters = false;

		$.each(siqqel.getRequiredHashParams(sqlQuery), function() {
			if(typeof(hashParams[this]) == 'undefined') {
				errorCallback('Please enter a value for #' + this, 0, '');
				missingHashParameters = true;
			}

			sendHashParams[this] = hashParams[this];
		});

		if(missingHashParameters) return;

		var params = {
			SQL: sqlQuery,
			hashParams: hashParams
		};

		$.getJSON(this.baseUrl + '?callback=?', {'server': serverId, 'sql': $.toJSON(params)}, function(result, textStatus) {
			//var result = undefined;
			//eval('result = ' + data);
			if(result.ERROR) {
				errorCallback(result.ERROR,  0, '');
			} else if(result.MYSQL_ERRNO) {
				errorCallback(result.MYSQL_ERROR, result.MYSQL_ERRNO, result.SERVER);
			} else {
				successCallback(result.RESULT.ROWS, result.RESULT.HEADER, result.RESULT.TYPES, result.SERVER);
			}
		});
	}
};
