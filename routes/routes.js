module.exports = function(express, app, session, papa, UserModel, d3, multiparty, fs, mongoose, db, path, gridfs, pug, visitor, bcrypt, xlsxj, xlsj, request, excel, stripe, qs) {
        
    function loginRequired (req, res, next) {
        var path = req._parsedOriginalUrl.pathname;
        if (req.method === 'GET') {  
            if(path == '/' || path == '/termsofuse' || path == '/login' || path == '/logout' || path == '/register' || path == '/invite') {
                next()
            }
            else {
                if(!req.session.email) {
                    var pathArr = path.split('/');
                    path = pathArr.join('%2F')
                    res.redirect('/login?path=' + path)
                }
                else {
                    next()
                }
            }
        }
        else {
            next()
        }
    }
    
    app.use(loginRequired)
    
    app.get('*',function(req,res, next){  
        if (req.headers["x-forwarded-proto"] === "https"){
            return next();
        }
        else 
            res.redirect('https://www.gosset.co'+req.url);
    })
    
    app.get('/', function(req, res) {
        if(req.session.email)
            res.redirect('/dashboard')
        else 
            res.render('home');
    })
    
    app.get('/logout', function(req, res) {
        if(!req.session.email) {
            res.redirect('/')
        }
        else {
            console.log(req.session.email + " logged out.");
            req.session.destroy();
            res.redirect('/')
        }
    })
    
    app.get('/login', function(req, res) {
        req.session.email = null;
        if(req.query.failed)
            res.render('login', {failed: true});
        else
            res.render('login', {failed: false})
    });
    
    app.post('/login', function(req, res) {
        var email = req.body.email;
        var password = req.body.password;
        UserModel.findOne({email: email}, function(err, user) {
            if(err) {
                console.log("Login error");
                res.status(404).send("Error");
            }
            if(user) {
                if(bcrypt.compareSync(password, user.password)) {
                    console.log(email + " logged in.")
                    req.session.email = email;
                    if(req.body.path == '') {
                        res.redirect('/dashboard')
                    }
                    else {
                        res.redirect(req.body.path)
                    }
                }
                else {
                    res.redirect('/login?failed=true&path=' + req.body.path.split('/').join('%2F'));
                }
            }
            else {
                res.redirect('/login?failed=true&path=' + req.body.path.split('/').join('%2F'));
            }
        });
        
    })
    
    app.post('/registerEmail', function(req, res) { //from home page
        if(req.body.email) 
            res.redirect('/register?email=' + req.body.email)
        else
            res.redirect('/')
    })
    
    app.get('/register', function(req, res) {
        res.render('register', {email:req.query.email})
    })
    
    app.post('/register', function(req, res) {
        UserModel.findOne({email: req.body.email}, function(err, user) {
            if(err)
                console.log(err)
            if(!user) {
                //visitor.event("Register", "User Registration").send()
                var email = req.body.email;
                var receiveEmail;
                if(req.body.receiveEmail) 
                    receiveEmail = true;
                else
                    receiveEmail = false;
                var newUser = new UserModel();
                newUser.firstName = req.body.firstName;
                newUser.lastName = req.body.lastName;
                newUser.email = req.body.email;
                newUser.receiveEmail = receiveEmail;
                newUser.password = bcrypt.hashSync(req.body.password, 10);
                newUser.dateCreated = new Date();
                newUser.stripe = null;
                newUser.owed = 0;
                newUser.save(function(err, saved) {
                    if(err)
                        throw err;
                    console.log(email + " registered")
                    req.session.email = email;
                    res.redirect('/invite?ref=' + email)
                })
            }
            else 
                res.redirect('/register')
        })
    }); 
    
    app.get('/invite', function(req, res) {
        res.render('invite', {ref:req.query.ref})
    })
    
    app.post('/invite', function(req, res) {
        var arr = []
        for(var key in req.body) {
            if(key != 'refEmail' && req.body[key].length > 0) {
                arr.push(req.body[key])
            }
        }
        db.collection('users').update({email:req.body.refEmail}, {
            $set: {invited:arr}
        }, function(err, results) {
            if(err)
                console.log(err)
            res.redirect('/')
        })
    })
    
    app.post('/upload', function(req, res) {
        
        var form = new multiparty.Form()
        
        form.parse(req, function(err, fields, files) {
            if(err)
                console.log(err);
            if(fields.title[0].length <= 0 || fields.description[0].length <= 0 || !files.file[0]) {
                console.log('invalid upload')
                res.redirect('/')
            }
            else {
                var file = files.file[0];

                var ext = file.originalFilename.split('.')[1]
                if(ext == 'xlsx' || ext == 'xltx' || ext == 'xls' || ext == 'xlw' || ext == 'xml' || ext == 'csv') {
                    var writeStream = gridfs.createWriteStream({filename: file.originalFilename,
                                                                metadata: {
                                                                    email: req.session.email,
                                                                    title: fields.title[0],
                                                                    description: fields.description[0],
                                                                    price: parseInt(fields.dollar[0]) + (parseInt(fields.cent[0]) / 100)
                                                                }
                    })
                    fs.createReadStream(file.path).pipe(writeStream)
                    writeStream.on('close', function(file) {
                        console.log(req.session.email + " uploaded " + file.originalFilename)
                        UserModel.findOne({email:req.session.email}, function(err, user) {
                            if(err)
                                console.log(err)
                            if(user.stripe) {
                                res.redirect('/')
                            }
                            else {
                                if(parseInt(fields.dollar[0]) + (parseInt(fields.cent[0]) / 100) != 0) {
                                    console.log(req.session.email + ' not onboarded yet; redirecting to /authorize')
                                    res.redirect('/authorize')
                                }
                                else {
                                    res.redirect('/')
                                }
                            }
                        })  
                    })
                }
                else {
                    console.log(req.session.email + " uploaded the wrong filetype")
                    res.redirect('/dashboard')
                } 
            }
        })
    })  
    
    app.get('/download/:id', function(req, res) {  //using req.query to determine how to export (ext will be rawDownload, json, or csv)
        gridfs.findOne({_id: req.params.id}, function(err, file) {
            if(err)
                console.log(err)
            if(!file) {
                console.log("File not found");
                res.redirect('/')
            }
            else {
                UserModel.findOne({email:req.session.email}, function(error, user) {
                    if(error)
                        console.log(error)
                    if(user.cart.indexOf(req.params.id) > -1 || file.metadata.email == req.session.email) {
                        var ext = file.filename.split('.')[1]
                        var readStream = gridfs.createReadStream({_id: file._id})
                        readStream.on('error', function(err) {
                            console.log(err)
                        })
                        
                        if(req.query.ext == 'rawDownload') {
                            res.set('Content-Type', file.contentType);
                            res.set("Content-Disposition", 'attachment; filename="' + file.filename + '"')
                            readStream.pipe(res)
                            readStream.on('close', function(err) {
                                console.log(req.session.email + " downloaded " + file.filename)
                            })
                        }
                        else {
                            if(ext == 'xlsx') {
                                var path = '/tmp/' + file.filename,
                                    jsonFile = file.filename.split('.')[0] + '.json',
                                    csvFile = file.filename.split('.')[0] + '.csv'
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)
                                
                                readStream.on('close', function(err) {
                                    if(err)
                                        console.log(err)
                                        
                                    if(req.query.ext == 'json') {
                                        console.log(req.session.email + " downloaded " + jsonFile)
                                        xlsxj({
                                            input: path,
                                            output: null
                                        }, function(err, result) {
                                            if(err) 
                                                console.log(err)
                                            else {
                                                res.json(result)
                                            }
                                        }) 
                                    }
                                    else if(req.query.ext == 'csv') {
                                        console.log(req.session.email + " downloaded " + csvFile)
                                        xlsxj({
                                            input: path,
                                            output: null 
                                        }, function(err, result) {
                                            if(err) 
                                                console.log(err)
                                            else {
                                                res.set("Content-Disposition", 'attachment; filename="' + csvFile + '"')
                                                res.send(new Buffer(papa.unparse(result)))
                                            }
                                        }) 
                                    }
                                })
                            }
                            else if(ext == 'xls') {
                                var path = '/tmp/' + file.filename,
                                    jsonFile = file.filename.split('.')[0] + '.json',
                                    csvFile = file.filename.split('.')[0] + '.csv'
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)
                                
                                readStream.on('close', function(err) {
                                    if(err)
                                        console.log(err)
                                    
                                    if(req.query.ext == 'json') {
                                        console.log(req.session.email + " downloaded " + jsonFile)
                                        xlsj({
                                            input: path,
                                            output: null 
                                        }, function(err, result) {
                                            if(err) 
                                                console.log(err)
                                            else {
                                                res.json(result)
                                            }
                                        }) 
                                    }
                                    else if(req.query.ext == 'csv') {
                                        console.log(req.session.email + " downloaded " + csvFile)
                                        xlsj({
                                            input: path,
                                            output: null
                                        }, function(err, result) {
                                            if(err) 
                                                console.log(err)
                                            else {
                                                res.set("Content-Disposition", 'attachment; filename="' + csvFile + '"')
                                                res.send(new Buffer(papa.unparse(result)))
                                            }
                                        }) 
                                    }
                                })
                            }
                        }
                    }
                    else {
                        res.redirect('/')
                    }
                })
            }
        })
    })
    
    app.get('/mydata', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            UserModel.findOne({email:req.session.email}, function(err, user) {
                if(err)
                    console.log(err)
                res.render('mydata', {cart:user.cart})
            })
        }
    })
    
    app.get('/dashboard', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            UserModel.findOne({email:req.session.email}, function(err, user) {
                if(err)
                    console.log(err);
                gridfs.files.find({'metadata.email': req.session.email}).toArray(function(err, data) {
                    if(err)
                        console.log(err) 
                    if(user.dateCreated < new Date('Wed Jul 12 2016 23:29:59 GMT+0000 (UTC)')) { //check if created before I started new TOS
                        res.render('dashboard', {user:user, data:data, showTOS:true})
                    }
                    else {
                        res.render('dashboard', {user:user, data:data, showTOS:false})
                    }
                })
            })
        } 
    }) 
    
    app.get('/store', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            if(req.query.category) {
                gridfs.files.find({"metadata.category": req.query.category}).toArray(function(err, data) {
                    if(err)
                        console.log(err)
                    res.render('store', {category:req.query.category.charAt(0).toUpperCase() + req.query.category.substring(1), data:data})
                })
            }
            else {
                res.render('store') // on cient-side, check if "category" exists
            }
        }
    })
    
    app.post('/store', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            console.log(req.body.search)
            gridfs.files.find({'metadata.description': { "$regex": req.body.search, "$options": "i" }}).toArray(function(err, files) { //checks description
                if(err)
                    console.log(err)
                if(files[0])
                    res.render('store', {search:req.body.search, data:files})
                else {
                    gridfs.files.find({'metadata.title': { "$regex": req.body.search, "$options": "i" }}).toArray(function(err, files) { //checks title
                        if(err)
                            console.log(err)
                        res.render('store', {search:req.body.search, data:files})
                    })
                }
            })
        }
    })
    
    app.get('/blog', function(req, res) {
        res.redirect('https://medium.com/@34ndju')
    })

    app.get('/product/:id', function(req, res) {
        if(!req.session.email)
            res.redirect('/login') 
        else { 
            gridfs.findOne({_id:req.params.id}, function(err, data) {
                if(err)
                    console.log(err)
                if(!data.metadata.sample) {
                    
                    //get headers
                    var readStream = gridfs.createReadStream({_id: data._id})
                    var path = '/tmp/' + data.filename
                    var out = fs.createWriteStream(path)
                        readStream.pipe(out)
                        
                    readStream.on('close', function(err) {
                        if(err)
                            console.log(err)
                        
                        var ext = data.filename.split('.')[1] 
                        if(ext == 'xls' || ext == 'xlsx' || ext == 'xlsb' || ext == 'xlsm' || ext =='xml'){
                            var workbook = excel.readFile(path);
                            if(workbook.Sheets.Sheet1) {
                                var sheet1 = workbook.Sheets.Sheet1
                                var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
                                var keepParsing = true;
                                var headers = []
                                var currentCell;
                                while(keepParsing) {
                                    currentCell = alphabet[0] + '1'
                                    if(sheet1[currentCell]) {
                                        headers.push(sheet1[currentCell].v)
                                        alphabet.shift();
                                    }
                                    else
                                        keepParsing = false;
                                }
                            }
                            else {
                                headers = []
                            }
                        }
                        else if(ext == 'csv') {
                            var csv = fs.readFileSync(path, 'utf8').split("\r")[0]
                            var headers = csv.split(',')
                        }
                        
                        var headerStr = headers.join(', ')
                        
                        UserModel.findOne({email:req.session.email}, function(err, user) {
                            if(err)
                                console.log(err)
                                
                            var isOwner; //check if item belongs to current user's session
                            var isPurchased; //check if item is already purchased
                            
                            if(data.metadata.email == req.session.email) {
                                isOwner = true;
                                isPurchased = false;
                            }
                            else {
                                isOwner = false;
                                if(user.cart.indexOf(req.params.id) > -1)
                                    isPurchased = true;
                                else
                                    isPurchased = false;
                            }
                            if(!req.query.paymentError) {
                                res.render('product', {isPurchased:isPurchased, isOwner:isOwner, data:data, sample:false, headers: headerStr});
                            }
                            else {
                                res.render('product', {isPurchased:isPurchased, isOwner:isOwner, data:data, sample:false, headers: headerStr, paymentError: req.query.paymentError.split('%20').join(' ')});
                            }
                        })
                    })
                }
                else {
                    console.log(req.path)
                    res.render('product', {data:data, sample:true, path:req.path});
                }
            })
        }
    })

    app.get('/totalremove/:id', function(req, res) {
        if(!req.session.email) {
            res.redirect('/login')
        }
        else {
            gridfs.findOne({_id:req.params.id}, function(err, file) {
                if(err)
                    console.log(err)
                if(file.metadata.email == req.session.email) {
                    gridfs.remove({_id:req.params.id}, function(error) {
                        if(error)
                            console.log(error)
                        console.log(req.session.email + " removed file ID " + req.params.id);
                        res.redirect('/')
                    })
                }
                else
                    res.redirect('/')
            })
        }
    })
    
    app.get('/termsofuse', function(req, res) {
        res.render('termsofuse');
    })

    app.get('/medR', function(req, res) {
        res.redirect('/?utm_source=Medium&utm_medium=Blog&utm_campaign=Medium%20Blogs');
    })
    
    app.get('/listFolder/:name', function(req, res) {
        res.send(fs.readdirSync(req.params.name))
    })
    
    app.post('/pay', function(req, res) {
        var idString = req.body.id.replace(/['"]+/g, '')
        
        gridfs.findOne({_id:idString}, function(err, data) {  //because strings have "...."
            if(err)
                console.log(err)
                
            var token = req.body.token;
            
            var price = data.metadata.price * 100;
            var commission = Math.round(price * 15) / 100
            var toSeller = price - commission
            
            UserModel.findOne({email:data.metadata.email}, function(err, user) {
                if(err)
                    console.log(err)
                if(user.stripe){ //stripe already setup for seller
                    console.log('stripe exists')
                    stripe.charges.create(
                        {
                            amount: price, // amount in cents
                            currency: "usd",
                            source: token,
                            description: "Purchased " + data.metadata.title,
                            application_fee: commission // amount in cents
                        },
                        {stripe_account: user.stripe.stripe_user_id}, //seller
                        function(error, charge) {
                            if(error) {
                                console.log(error)
                                if(req.body.error == '') 
                                    res.redirect('/product/' + idString + '?paymentError=' + error.raw.message.split(' ').join('%20'))
                                else
                                    res.redirect('/product/' + idString + '?paymentError' + req.body.error.split(' ').join('%20'))
                            }
                            else {
                                console.log('charge21', charge)
                                res.redirect('/addToPurchased?id=' + idString)
                            }
                        }
                    )
                }
                else { //stripe not setup for seller
                    console.log('stripe does not exist')
                    
                    stripe.charges.create({
                        amount: price, // amount in cents, again
                        currency: "usd",
                        source: token,
                        description: "Credit Card Charged to Unregistered " + user.email
                    }, function(error, charge) {
                        if (error)  {
                            console.log(error)
                            if(req.body.error == '') 
                                res.redirect('/product/' + idString + '?paymentError=' + error.raw.message.split(' ').join('%20'))
                            else
                                res.redirect('/product/' + idString + '?paymentError=' + req.body.error.split(' ').join('%20'))
                        }
                        else {
                            console.log('charge25', charge)
                            
                            var preOwed = user.owed
                            user.owed = preOwed + (toSeller / 100)
                            user.save()
                            
                            res.redirect('/addToPurchased?id=' + idString)
                        }
                    });
                }
            })
        })
    })
    
    app.get('/addToPurchased', function(req, res) {
        UserModel.findOne({email:req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            if(user.cart.indexOf(req.query.id) < 0) { //check if the id already exists in array
                user.cart.push(req.query.id)
                user.save()
            }
            res.redirect('/product/' + req.query.id)
        })
    })
    
    app.get('/onboardMerchant', function(req, res) {
        res.render('onboardMerchant')
    })
    
    app.get('/authorize', function(req, res) {
        res.redirect('https://connect.stripe.com/oauth/authorize?' + qs.stringify({  //change in production
            response_type: "code",
            scope: "read_write",
            client_id: process.env.CLIENT_ID
        }));
    })
    
    app.get('/oauth/callback', function(req, res) {
        UserModel.findOne({email:req.session.email}, function(err, user) {
            var code = req.query.code;
            request.post({
                url: 'https://connect.stripe.com/oauth/token',  //change in production
                form: {
                    grant_type: "authorization_code",
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    code:code
                }},
                function(err, response, body) {
                    if(err)
                        console.log(err)
                    else {
                        var stripe = JSON.parse(body)
                        console.log(stripe)
                        user.stripe = stripe
                        user.save()
                        res.redirect('/')
                    }
                }
            )
        })
    })
    
    app.post('/stripeWebhooks', function(req, res) {
        console.log('Stripe Webhook Received:', req.body)
        res.status(200).send()
    })



    /*
    when going into production, remember:
    -webhooks to new site
    -client id
    -client secret
    */


    //deprecated because lack of time. would like to reactivate when incorporated using Stripe (managed accounts)
    /*
    app.post('/onboardMerchant', function(req, res) {
        req.session.email = 'jun73521@gmail.com'
        UserModel.findOne({email:req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            console.log(user)
            stripe.accounts.create({
                managed: true,
                country: 'US',
                legal_entity: {
                    dob: {
                        day: 10,
                        month: 1,
                        year: 1986
                    },
                    first_name: "Jonathan",
                    last_name: "Goode",
                    type: "individual",
                    address: {
                        line1: "3180 18th St",
                        postal_code: 94110,
                        city: "San Francisco",
                        state: "CA"
                    },
                    ssn_last_4: 1234
                },
                external_account: {
                    object: "bank_account",
                    country: "US",
                    currency: "usd",
                    routing_number: "110000000",
                    account_number: "000123456789",
                },
                tos_acceptance: {
                    date: Math.floor(user.dateCreated / 1000),
                    ip: req.connection.remoteAddress // Assumes you're not using a proxy
                }
                }, function(err, account) {
                    console.log(req.body)
                    console.log(account)
            })
        })
    })
    
    app.get('/stripePay', function(req, res) {
        stripe.charges.create({
            amount: 99999999,
            currency: "usd",
            source: {
                object: "card",
                number: " 4000000000000077",
                exp_month: 2,
                exp_year: 2017
            },
            destination: 'acct_18W6QvAKefMwbq0p'
            }, function(err, charge) {
                if(err)
                    console.log('error1', err)
                console.log('charge', charge)
                stripe.accounts.retrieve( 'acct_18W6QvAKefMwbq0p',
                function(error, account) {
                    if(error)
                        console.log('error2', error)
                    console.log('account',account);
                }
            );
        });
    })
    
    app.get('/test3', function(req, res) {
        stripe.transfers.create({
            amount: 400,
            currency: "usd",
            recipient: "self"
        }, {
            stripe_account: 'acct_18W6QvAKefMwbq0p'
        }, function(err, transfer) {
            if(err)
                console.log(err)
            console.log('transfer', transfer)
        });
    })
    */
}