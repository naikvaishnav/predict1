var request = require('request');
var moment = require('moment');

module.exports = function(app, db) {

	app.post('/signup', (req, res) => {
	    var dbo = db.db("prediction");
	    var query = { email: req.query.email };
		dbo.collection("users").find(query).toArray(function(err, result) {
		    if (err) {
		    	res.send({ 'message': 'An error has occurred' });
		    } else {
		    	if(!result.length){
		    		var myobj = { fname: req.query.fname, lname: req.query.lname, email: req.query.email };
					dbo.collection("users").insertOne(myobj, function(error, output) {
					    if (error) {
					    	res.send({ 'message': 'An error has occurred' });
					    } else {
					    	res.send({'message': 'success'});
					    }
					    
					});
		    	} else {
		    		res.send({'message': 'User already exist.'});
		    	}
		    }
		});
	});

	app.post('/login', (req, res) => {
		if(req.query.updated == 2){
		    var dbo = db.db("prediction");
		    var query = { email: req.query.email };
			dbo.collection("users").find(query).toArray(function(err, result) {
			    if (err) {
			    	res.send({ 'error': 'An error has occurred' });
			    } else {
			    	if(!result.length){
						res.send({ 'message': 'User not available' });
			    	} else {
			    		res.send({'message': 'Success'});
			    	}
			    }
			});
		}else{
			res.send({ 'error': 'Update your app' });
		}
	});

	app.post('/getusers', (req, res) => {
	    var dbo = db.db("prediction");
		dbo.collection("users").find().toArray(function(err, result) {
		    if (err) {
		    	// console.log(err);
		    	res.send({ 'message': 'An error has occurred' });
		    } else {
		    	// console.log(result);
				res.send({ 'data': result });
		    }
		});
	});

	app.post('/deleteuser', (req, res) => {
	    var dbo = db.db("prediction");	
		dbo.collection("users").remove({ email: req.query.email }, function(err, result) {
            if (err) {
                res.send({ 'message': 'An error has occurred' });
            }
            res.send({ 'message': 'Deleted Successfully' });
        })
	});

	

	app.post('/matcheslist', (req, res) => {
		request('https://cricapi.com/api/matches?apikey=HJwez63lSmRrFffrXsGAZgwIsZm1', function (error, response, body) {
		    if (!error && response.statusCode == 200) {
		        let livaMatchData = JSON.parse(body);
				let count = 0;
				livaMatchData.matches.forEach((match) => {
					count += 1;
					if(match.type === "ODI" && match.matchStarted && (match.unique_id > 1144482) && (match.unique_id < 1144530)){
						var dbo = db.db("prediction");
						dbo.collection('matches').findAndModify(
							{unique_id: match.unique_id},
							[['unique_id','asc']],
							{ $set: match },
							{upsert: true, new: true},
							function(err, object) {
								if (err){
									// console.log('error', err);
								}else{
									// console.log('success');
								}
							}
						);
					}
					if(count === livaMatchData.matches.length){
						setTimeout(function(){
							var dbo = db.db("prediction");
							dbo.collection("matches").find().toArray(function(err, result) {
								if (err) {
									res.send({'data':{ 'error': 'An error has occurred' }});
								} else {
									res.send({'data': result});
								}
							});
						}, 3000);
					}
		        });
		    }
		})    
	});

	app.post('/setprediction', (req, res) => {
		let durationLeft = moment(req.query.date).endOf('hour').fromNow().split(' ')[2];
		// console.log(durationLeft);
		if(durationLeft === 'hour' || durationLeft === 'ago' || durationLeft === 'minutes'){
		    res.send({ 'data': 'timeover' });
		}else{
			var dbo = db.db("prediction");
			dbo.collection('user_prediction').findAndModify(
				{email:req.query.email, unique_id: req.query.unique_id, team1: req.query.team1, team2: req.query.team2, winner_team: null},
				[['unique_id','asc']],  // sort order
				{ $set: { prediction: req.query.prediction } }, // replacement, replaces only the field "hi"
				{upsert: true, new: true}, // options
				function(err, object) {
				    if (err){
				      	res.send({ 'data': 'An error has occurred' });
				        // console.log(err.message);  // returns error if no matching object found
				    }else{
				      	res.send({'data': 'success'});
				        // console.log(object);
				    }
			    }
			);
		}
	});

	app.post('/totalcount', (req, res) => {
	    var dbo = db.db("prediction");
		dbo.collection("matches").find({matchStarted: true}).toArray(function(err, result) {
		    if (err) {
		    	// console.log(err);
		    	res.send({ 'message': 'An error has occurred' });
		    } else {
				// console.log(result);
				let matches = [];
				let count = 0;
				result.forEach((match) => {
					count += 1;
					if(match.winner_team){
						matches.push(match);
					}
					if(count === result.length){
						setTimeout(function(){res.send({ 'data': matches })}, 100);
					}
				});
		    }
		});
	});

	app.post('/showprediction', (req, res) => {
		let matchData = [];
	    var dbo = db.db("prediction");
	    dbo.collection("users").find().forEach(function(myDoc) {
	    	var query = { email: myDoc.email, unique_id: req.query.unique_id };
	    	dbo.collection("user_prediction").find(query).toArray(function(error, output) {
			    if (error) {
			    	res.send({ 'error': 'An error has occurred' });
			    } else {
			    	let tempObj = {};
			    	if(!output.length){
			    		tempObj = {
							email: myDoc.email,
			    			fname: myDoc.fname,
			    			lname: myDoc.lname,
			    			prediction: "LS"
			    		}
			    		matchData.push(tempObj);
			    	} 
			    	else {
			    		tempObj = {
							email: myDoc.email,
			    			fname: myDoc.fname,
			    			lname: myDoc.lname,
			    			prediction: output[0].prediction
			    		}
			    		matchData.push(tempObj);
			    	}
			    }
			});
	    } );
	    setTimeout(function(){res.send({'data': matchData})}, 1000);
	});

};

