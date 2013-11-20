({
        dependencies: {
            "css": ["css/style.css"],
            "js": [
                "js/jquery-1.4.2-min.js", "js/json.js", "js/dbslayer.js" ,"js/hashParams.js",
                "js/variableInputPanel.js", "js/siqqelLib.js"
            ]
        },

        config: {"baseUrl": "/siqqel/"},

	loadFileContents: function(url, callback) {
		var xmlHttpReq = false;
		var self = this;

		var xmlHttpReq = new XMLHttpRequest();
		xmlHttpReq.open('GET', url, true);
		xmlHttpReq.setRequestHeader('Content-Type', 'application/javascript');
		xmlHttpReq.onreadystatechange = function() {
			if (xmlHttpReq.readyState == 4) {
				var data = xmlHttpReq.responseText;
				callback(data);
			}
		};
		xmlHttpReq.send('');
	},

	loadJs: function(src) {
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('script');
		s.setAttribute('src', src);
		head.appendChild(s);
	},

	loadCss: function(src) {
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('link');
		s.setAttribute('rel', 'stylesheet');
		s.setAttribute('href', src);
		head.appendChild(s);
	},

	loadJsAsync: function(srcs) {
		var self = this;

		var src = srcs.shift();

		this.loadFileContents(this.config.baseUrl + src, function(data) {
			var head = document.getElementsByTagName('head')[0];
			var s = document.createElement('script');
			s.textContent = data;
			head.appendChild(s);

			if(srcs.length > 0) self.loadJsAsync(srcs);
		})
	},

	init: function() {
		window.siqqelBaseUrl = this.config.baseUrl;
		/*for (var i = 0; i < this.config.javaScriptFiles.length; i++) {
			this.loadJs(this.config.baseUrl + this.config.javaScriptFiles[i]);
		}*/

		this.loadJsAsync(this.dependencies.js);

		for (var i = 0; i < this.dependencies.css.length; i++) {
			this.loadCss(this.config.baseUrl + this.dependencies.css[i]);
		}

	}
}).init();

siqqelReadyCallbacks = [];

function siqqelReady(callback) {
	siqqelReadyCallbacks.push(callback);
}