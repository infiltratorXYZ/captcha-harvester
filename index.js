const open = require("open");
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const hostile = require('hostile')
const fs = require('fs');

var cfg = require('./config.json')

var website = {
	sitekey: cfg['sitekey'],
	url: cfg['url'],
	port: cfg['port'],
    gResponse: 'Solve captcha'
}

app.use(
    bodyParser.urlencoded({
	extended: false
}))

app.listen(website.port, () => console.log('Listening on port ' + website.port))
app.get('/', function (req, res) {
	res.send(`<!DOCTYPE HTML>
	<html>
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title>Captcha Harvester</title>
		</head>
		<body style="background-color: #303030;">
            <div style="position: absolute;top: 60%;left: 50%;transform: translate(-50%, -50%);">
                <input type="text" value="${website.gResponse}" id="myInput">
                <button onclick="myFunction()">Copy text</button>
            </div>
			<div class="g-recaptcha" data-callback="sendToken" data-sitekey="${website.sitekey}" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"></div>
			<script>
				function sendToken()
				{
					post('/', {'g-recaptcha-response': grecaptcha.getResponse()});
				}
				function post(path, params, method) {
					method = method || "post"; // Set method to post by default if not specified.

					// The rest of this code assumes you are not using a library.
					// It can be made less wordy if you use one.
					var form = document.createElement("form");
					form.setAttribute("method", method);
					form.setAttribute("action", path);

					for(var key in params) {
						if(params.hasOwnProperty(key)) {
							var hiddenField = document.createElement("input");
							hiddenField.setAttribute("type", "hidden");
							hiddenField.setAttribute("name", key);
							hiddenField.setAttribute("value", params[key]);

							form.appendChild(hiddenField);
						}
					}

					document.body.appendChild(form);
					form.submit();
				}
			</script>
			<script src='https://www.google.com/recaptcha/api.js'></script>


            <script>
            function myFunction() {
              var copyText = document.getElementById("myInput");
              copyText.select();
              copyText.setSelectionRange(0, 99999)
              document.execCommand("copy");
              alert("Copied the text: " + copyText.value);
            }
            </script>
		</body>
	</html>`)

})

app.post('/', function (request, response) {
	console.log(request.body);
    website.gResponse = request.body['g-recaptcha-response']

    fs.writeFile("gResponse.txt", website.gResponse, function(err) {
        if(err) {
            return console.log(err);
        }

    console.log("The file was saved!");
});
	response.redirect('/');
})

hostile.set('::1', 'captcha.' + website.url, function (err) {
	if (err) {
		console.error(err)
	} else {
        open('http://captcha.' + website.url + ':' + website.port);
	}
})
