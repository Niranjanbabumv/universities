var express = require('express');
var path = require('path');
var fs = require("fs");
var bodyParser = require('body-parser');
var nano = require('nano')('http://localhost:8080');
var app = express();
var multer  = require('multer');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var upload = multer({dest:__dirname + '/upload'});
var type = upload.single('file');

app.use('/', express.static(__dirname + '/'));
var cloudantUserName = "premdutt09";
var cloudantPassword = "sharma06@";
var dbCredentials_url = "https://"+cloudantUserName+":"+cloudantPassword+"@"+cloudantUserName+".cloudant.com"; // Set this to your own account 

// Initialize the library with my account. 
var cloudant = require('cloudant')(dbCredentials_url);

var dbForLogin = cloudant.db.use("logindetails");
var dbForStudentDetails = cloudant.db.use("studentdetails");
var dbForUnversityAdminRequest = cloudant.db.use("universityadminrequest"); 


// viewed at http://localhost:8080
app.get('/', function(req, res) {
console.log("Open AdminLogin.html page");
    res.sendFile(path.join(__dirname + '/AdminLogin.html'));
});

app.post('/loginInfo', function (req, res) {
console.log("Got a POST request for AdminLogin.html page");
console.log(JSON.stringify(req.body));
var userName = req.body.userName;
console.log(userName);
var password = req.body.password;
console.log(password);
	dbForLogin.get(userName, function(err, body) {
	  if (!err) {
		var dbPassword = body.agentPassword;
		if(dbPassword === password){
			var response = {
				status  : 200,
				message : 'Success'
			}
			res.send(JSON.stringify(response));	
		}else{
			var response = {
				status  : 300,
				message : 'Username and Password does not match'
			}
			res.send(JSON.stringify(response));	
		}	
	  }else{	
	  console.log(err);
			var response = {
				status  : 400,
				message : 'Username does not exists'
			}
			res.send(JSON.stringify(response));	
		}
	});
});



app.post('/studentInfo', type , function (req, res) {
console.log("Got a POST request for UserDetails.html page");
   console.log(req);
   fs.readFile(__dirname + '/upload/' + req.file.filename, function(err, data) {
	  if (!err) {
		console.log(data);
		dbForStudentDetails.multipart.insert(req.body, [{name: req.file.originalname, data: data, content_type: req.file.mimetype}], uniqueId , function(err, body) {
			if (!err){
			  console.log(body);
			  console.log("Open Success.html page");
			  res.sendFile(path.join(__dirname + '/Univ1Success.html'));
		    }else
			  console.log(err);
		});
	  }else
		  console.log(err);
	});
	var requestId = "REQ003";
	dbForRequestDetails.list(function(err, body) {
	  if (!err) {
		body.rows.forEach(function(doc) {
		  requestId = doc.id;
		  console.log(requestId);
		});
	  }
	 console.log(requestId);
	 requestId = requestId.replace(/(\d+)/, function(){return arguments[1]*1+1} );
	 console.log(requestId);
	 	var requestDetails = {
		requestDate : new Date().toJSON().slice(0,10).replace(/-/g,'/'),
		applicantName : req.body.name,
		status : 'Applied',
		digitalId : req.body.digitalId,
		appliedFor : req.body.course,
	}
		dbForUnversityAdminRequest.insert(requestDetails, requestId, function(err, body) {
		  if (!err)
			console.log(body);
		});
	});

});


app.listen(8080);