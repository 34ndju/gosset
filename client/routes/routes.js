module.exports = function(express, app, session, UserModel, mongoose) {
    app.get('/', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/home.html');
    });
    
    app.get('/login', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/login.html');
    });
    
    app.get('/logout', function(req, res) {
        if(!req.session.email) {
            res.status(200).send("No one is logged in yet");
        }
        else {
            console.log(req.session.email + " logged out.");
            req.session.destroy();
            res.sendFile(process.cwd() + '/client/html/loggedout.html');
        }
    })
    
    app.get('/dashboard', function(req, res) {
        if(!req.session.email)
            return res.status(401).send("No one is logged in");
        else {
            res.status(200).send('Welcome, ' + req.session.email + ', you are in a session');
        }
    });
    
    app.post('/login', function(req, res) {
        var email = req.body.email;
        var password = req.body.password;
        req.session.email = email;
        UserModel.findOne({email: email, password: password}, function(err, user) {
            if(err) {
                console.log("Login error");
                res.status(404).send("Error");
            }
            if(!user) {
                console.log("Failed login attempt");
                res.status(401).send("Incorrect parameters");
            }
            if(user) {
                console.log(email + " logged in.")
                req.session.email = email;
                res.sendFile(process.cwd() + '/client/html/myaccount.html');
            }
        });
        
    });
    
    app.get('/register', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/register.html');
    })
    
    app.post('/register', function(req, res) {
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var password = req.body.password;
        var address = req.body.address;
        var newUser = new UserModel();
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.email = email;
        newUser.password = password;
        newUser.address = address;
        newUser.save(function(err, saved) {
            if(err)
                throw err;
            else {
                req.session.email = email;
                res.sendFile(process.cwd() + '/client/html/myaccount.html');
            }
        });
    }); 
}