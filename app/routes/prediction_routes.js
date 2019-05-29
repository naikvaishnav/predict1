var request = require('request');

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
		        let livaMatchData = JSON.parse(body); // Print the google web page.
		        for (var i = 0; i < livaMatchData.matches.length; i++) {
		        	if(livaMatchData.matches[i].type === 'ODI' && livaMatchData.matches[i].matchStarted){
		        		// console.log(livaMatchData.matches[i]);
		        		    var dbo = db.db("prediction");
		        			dbo.collection('matches').findAndModify(
								{unique_id: livaMatchData.matches[i].unique_id},
								[['unique_id','asc']],  // sort order
								{ $set: livaMatchData.matches[i] }, // replacement, replaces only the field "hi"
								{upsert: true, new: true}, // options
								function(err, object) {
				    				if (err){
				      					// res.send({ 'error': 'An error has occurred' });
				        				// console.log(err.message);  // returns error if no matching object found
				    				}else{
				      					// res.send({'data': 'success'});
				        				// console.log(object);
				    				}
			    				}
							);
		        	}
		        }


		     }
		})
		setTimeout(function(){
			var dbo = db.db("prediction");
			dbo.collection("matches").find().toArray(function(err, result) {
			    if (err) {
			    	res.send({ 'error': 'An error has occurred' });
			    } else {
			    	res.send({'data': result});
			    }
			});
		}, 3000);	    
	});

	app.post('/setprediction', (req, res) => {
	    var dbo = db.db("prediction");
		dbo.collection('user_prediction').findAndModify(
			{email:req.query.email, unique_id: req.query.unique_id, team1: req.query.team1, team2: req.query.team2, winner_team: null},
			[['unique_id','asc']],  // sort order
			{ $set: { prediction: req.query.prediction } }, // replacement, replaces only the field "hi"
			{upsert: true, new: true}, // options
			function(err, object) {
			    if (err){
			      	res.send({ 'error': 'An error has occurred' });
			        console.log(err.message);  // returns error if no matching object found
			    }else{
			      	res.send({'data': 'success'});
			        console.log(object);
			    }
		    }
		);
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
			    			fname: myDoc.fname,
			    			lname: myDoc.lname,
			    			prediction: "LS"
			    		}
			    		matchData.push(tempObj);
			    	} 
			    	else {
			    		tempObj = {
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

