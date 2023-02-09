exports.loginHelper = function (data) {
    const html = `<!DOCTYPE html>
	<html>
		<head>
			<meta charset='utf-8'>
			<title>LIVESTREAM</title>
		</head>
		<body>
			<script type='text/javascript'>
				let data = ${JSON.stringify(data)};
	
				console.log(window.opener.CLIENT)

				window.opener.CLIENT.receiveLoginChildWindow(data);
	
				window.close();
			</script>
		</body>
	</html>`;

    return html;
};

exports.logoutHelper = function () {
    const html = `<!DOCTYPE html>
	<html>
		<head>
			<meta charset='utf-8'>
			<title>LIVESTREAM</title>
		</head>
		<body>
			<script type='text/javascript'>
				window.opener.CLIENT.receiveLogoutChildWindow();

				window.close();
			</script>
		</body>
	</html>`;

    return html;
};
