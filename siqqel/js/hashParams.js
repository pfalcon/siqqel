hashParams = {
	init: function(hashString) {
		var res = hashString.match(/([a-zA-Z0-9_]+):([a-zA-Z0-9_%]*)/g);
		if(!res) return;
		var params = this;
		$.each(res, function() {
			var r = this.match(/([a-zA-Z0-9_]+):([a-zA-Z0-9_%]*)/);
			params[r[1]] = unescape(r[2]);
		});

		$('title').text($('title').text().replace(/\s*\(.*/, '') + ' (' + hashString + ')');
	}
};

hashParams.init(document.location.hash);