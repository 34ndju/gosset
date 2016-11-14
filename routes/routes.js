module.exports = function(
    express, 
    app, 
    session, 
    papa, 
    UserModel, 
    fileMetadataModel, 
    d3, 
    multiparty, 
    fs, 
    mongoose, 
    db, 
    path, 
    gridfs, 
    pug, 
    visitor, 
    bcrypt, 
    xlsxj, 
    xlsj, 
    request, 
    excel, 
    stripe, 
    qs, 
    sql, 
    sqlBuilder, 
    csvjson) {
    
    function loginRequired (req, res, next) {
        var path = req._parsedOriginalUrl.pathname;
        if (req.method === 'GET') {
            var exceptions = ['/homecoming', '/homeCorrect', '/H10092016C', '/medR', '/e', '/metadata', '/xml', '/', '/termsofuse', '/login', '/logout', '/register', '/invite', '/medR', '/blog', '/resetPassword', '/product/576d50c430c66a5f0312cf9b']
            if(exceptions.indexOf(path) > -1) {
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
    
    function jsonToSQL(filename, json) {
        var table = filename.split('.')[0].split(' ').join('_')
        var keys = Object.keys(json[0])
        var definition = {};
        var keyStr = '('
        for(var i = 0; i < keys.length; i++) {
            var syntaxFixedKey = keys[i].split(' ').join('_')
            definition[syntaxFixedKey] = {
                type: 'varchar'
            }
            if(i != keys.length - 1) {
                keyStr += '"' + syntaxFixedKey + '", '
            }
            else {
                keyStr += '"' + syntaxFixedKey + '")'
            }
        }
        
        var createTableQuery = {
            type: 'create-table',
            table: table,
            ifNotExists: true,
            definition: definition
        }

        var valuesStr = ''
        var currentValStr;
        
        for(var x = 0; x < json.length; x++) {
            currentValStr = '('
            for(var y = 0; y < keys.length; y++) {
                if(y != keys.length - 1) {
                    currentValStr += json[x][keys[y]] + ', ' 
                }
                else {
                    currentValStr += json[x][keys[y]] + ')'
                }
            }
            if(x != json.length - 1) {
                valuesStr += currentValStr + ', '
            }
            else {
                valuesStr += currentValStr
            }
        }
        
        var result = sqlBuilder.sql(createTableQuery) + ';\ninsert into "' + table + '" ' + keyStr + ' values ' + valuesStr + ';'
        
        return result;
    }
    
    function jsonToXMLMetadata(json) {
        var parent = Object.keys(json)[0]
        var xml = ['<', 'EntityType', ' ', 'Name="Data"', '>', '\n']
        var headers = json[parent]['#']
        headers.forEach(function(h) {
            var arr = ['\t', '<Property Name="', h['Property']['@']['Name'], '" Type="', h['Property']['@']['Type'], '" Nullable="', h['Property']['@']['Nullable'], '"/>', '\n']
            xml.push(arr.join(''))
        })
        xml.push('</EntityType>')
        return xml.join('')
    }
    
    app.get('/metadata', function(req, res) {
        fileMetadataModel.findOne({_id:req.query.id}, function(err, metadata) {
            if(err)
                console.log(err)
            else {
                var json = {
                    EntityType: {
                        '@': {
                            Name: 'Data'
                        },
                        '#': [
                            {
                                Property: {
                                    '@': {
                                        Name: 'ID',
                                        Type:'Edm.Int32',
                                        Nullable:'false'
                                    }
                                }
                            },
                            {
                                Property: {
                                    '@': {
                                        Name: 'Price',
                                        Type:'Edm.Int32',
                                        Nullable:'false'
                                    }
                                }
                            }
                        ]    
                    }
                }
                
                metadata.headers.forEach(function(h) {
                    json['EntityType']['#'].push({
                        Property: {
                            '@': {
                                Name: h,
                                Type:'Edm.String',
                                Nullable:'false'
                            }
                        }
                    })
                })
                res.set('Content-Type', 'text/xml');
                res.send(jsonToXMLMetadata(json))
            }
        })
    })
    
    app.get('/e', function(req, res) {
        res.redirect('/?utm_source=Gmail&utm_medium=email&utm_content=Cold%20Email&utm_campaign=First%20Cold%20Email%20Campaign')
    })
    
    app.get('*',function(req,res, next){  
        if (req.headers["x-forwarded-proto"] === "https"){
            return next();
        }
        else 
            res.redirect('https://www.gosset.co'+req.url);
    })
    
    app.get('/', function(req, res) {
        if(req.session.email)
            res.redirect('/store')
        else {
            res.render('home');
        }
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
                        res.redirect('/')
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
            else {
                res.redirect('/')
            }
        })
    })
    
    app.get('/upload', function(req, res) {
        res.render('upload', {email:req.session.email})
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
                if(ext == 'xls' || ext == 'xlsx' || ext == 'xlsb' || ext == 'xlsm' || ext =='xml' || ext == 'csv' || ext == 'json') {
                    /*getting headers*/
                    if(ext == 'xls' || ext == 'xlsx' || ext == 'xlsb' || ext == 'xlsm' || ext =='xml'){
                        var workbook = excel.readFile(file.path);
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
                        var csv = fs.readFileSync(file.path, 'utf8')//.split("\r")[0]
                        var headers;
                        if(csv.indexOf("\n") == -1) {
                            headers = csv.split("\r")[0].split(',')
                        }
                        else {
                            headers = csv.split("\n")[0].split(',')
                        }
                    }
                    else if(ext == 'json') {
                        var headers = Object.keys(JSON.parse(fs.readFileSync(file.path, 'utf8'))[0])
                    }
                    /*getting headers*/
                
                    var writeStream = gridfs.createWriteStream({filename: file.originalFilename})
                    fs.createReadStream(file.path).pipe(writeStream)
                    writeStream.on('close', function(file) {
                        var newFileMetadata = new fileMetadataModel();
                        
                        newFileMetadata._id = file._id
                        newFileMetadata.email = req.session.email
                        newFileMetadata.title = fields.title[0]
                        newFileMetadata.sentence = fields.sentence[0]
                        newFileMetadata.description = fields.description[0]
                        newFileMetadata.filename = file.filename
                        newFileMetadata.length = file.length
                        newFileMetadata.uploadDate = file.uploadDate
                        newFileMetadata.headers = headers
                        newFileMetadata.price = parseInt(fields.dollar[0]) + (parseInt(fields.cent[0]) / 100)
                        newFileMetadata.category = null

                        
                        newFileMetadata.save()

                        console.log(req.session.email + " uploaded " + file.filename)
                        UserModel.findOne({email:req.session.email}, function(err, user) {
                            if(err)
                                console.log(err)
                            if(user.stripe) {
                                res.redirect('/dashboard')
                            }
                            else {
                                if(parseInt(fields.dollar[0]) + (parseInt(fields.cent[0]) / 100) != 0) {
                                    console.log(req.session.email + ' not onboarded yet; redirecting to /authorize')
                                    res.redirect('/authorize')
                                }
                                else {
                                    res.redirect('/dashboard')
                                }
                            }
                        })  
                    })
                }
                else {
                    console.log(req.session.email + " uploaded the wrong filetype")
                    res.redirect('/upload')
                } 
            }
        })
    })  
    
    app.get('/download/:id', function(req, res) {  //using req.query to determine how to export (ext will be rawDownload, json, or csv)
        fileMetadataModel.findOne({_id: req.params.id}, function(err1, metadata) {
            if(err1)
                console.log('err1', err1)
            if(!metadata) {
                console.log("File not found");
                res.redirect('/')
            }
            else {
                UserModel.findOne({email:req.session.email}, function(err2, user) {
                    if(err2)
                        console.log('err2', err2)
                    else if(metadata.id == '576d50c430c66a5f0312cf9b' || user.cart.indexOf(req.params.id) > -1 || metadata.email == req.session.email || metadata.price == 0) {
                        var ext = metadata.filename.split('.')[1]
                        var readStream = gridfs.createReadStream({_id: metadata._id})
                        
                        readStream.on('error', function(err3) {
                            console.log('err3', err3)
                        })
                        
                        if(ext == req.query.ext) {
                            res.redirect('/download/' + req.params.id + '?ext=rawDownload')
                        }
                        else if(req.query.ext == 'rawDownload') {
                            res.set("Content-Disposition", 'attachment; filename="' + metadata.filename + '"')
                            readStream.pipe(res)
                            readStream.on('close', function(err4) {
                                if(err4)
                                    console.log('err4', err4)
                                else
                                    console.log(req.session.email + " downloaded " + metadata.filename)
                            })
                        }
                        else if (metadata.length > 10000000) {
                            res.redirect('/product/' + req.params.id + '?tooLarge=true')
                        }
                        else {
                            if(ext == 'xlsx') {
                                var path = '/tmp/' + metadata.filename,
                                    jsonFile = metadata.filename.split('.')[0] + '.json',
                                    csvFile = metadata.filename.split('.')[0] + '.csv'
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)
                                
                                readStream.on('close', function(error1) {
                                    if(error1)
                                        console.log('error1', error1)
                                        
                                    if(req.query.ext == 'json' || req.query.ext == 'sql') {
                                        xlsxj({
                                            input: path,
                                            output: null
                                        }, function(error2, result) {
                                            if(error2) 
                                                console.log('error2', error2)
                                            else {
                                                if(req.query.ext == 'json') {
                                                    res.json(result)
                                                }
                                                else if(req.query.ext == 'sql') {
                                                    var buffer = new Buffer(jsonToSQL(metadata.filename, result))
                                                    res.set("Content-Disposition", 'attachment; filename="' + metadata.filename.split('.')[0]+ '.sql' + '"')
                                                    res.send(buffer)
                                                }
                                            }
                                        }) 
                                    }
                                    else if(req.query.ext == 'csv') {
                                        console.log(req.session.email + " downloaded " + csvFile)
                                        xlsxj({
                                            input: path,
                                            output: null 
                                        }, function(error2, result) {
                                            if(error2) 
                                                console.log('error2', error2)
                                            else {
                                                res.set("Content-Disposition", 'attachment; filename="' + csvFile + '"')
                                                res.send(new Buffer(papa.unparse(result)))
                                            }
                                        }) 
                                    }
                                })
                            }
                            else if(ext == 'xls') {
                                var path = '/tmp/' + metadata.filename,
                                    jsonFile = metadata.filename.split('.')[0] + '.json',
                                    csvFile = metadata.filename.split('.')[0] + '.csv'
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)
                                
                                readStream.on('close', function(error1) {
                                    if(error1)
                                        console.log('error1', error1)
                                    
                                    if(req.query.ext == 'json' || req.query.ext == 'sql') {
                                        
                                        xlsj({
                                            input: path,
                                            output: null 
                                        }, function(error2, result) {
                                            if(error2) 
                                                console.log('error2', error2)
                                            else {
                                                if(req.query.ext == 'json')
                                                    res.json(result)
                                                else if(req.query.ext == 'sql') {
                                                    var buffer = new Buffer(jsonToSQL(metadata.filename, result))
                                                    res.set("Content-Disposition", 'attachment; filename="' + metadata.filename.split('.')[0]+ '.sql' + '"')
                                                    res.send(buffer)
                                                }
                                            }
                                        }) 
                                    }
                                    else if(req.query.ext == 'csv') {
                                        console.log(req.session.email + " downloaded " + csvFile)
                                        xlsj({
                                            input: path,
                                            output: null 
                                        }, function(error2, result) {
                                            if(error2) 
                                                console.log('error2', error2)
                                            else {
                                                res.set("Content-Disposition", 'attachment; filename="' + csvFile + '"')
                                                res.send(new Buffer(papa.unparse(result)))
                                            }
                                        }) 
                                    }
                                })
                            }
                            else if(ext == 'csv') {

                                var path = '/tmp/' + metadata.filename
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)

                                readStream.on('close', function(error1) {
                                    if(error1)
                                        console.log('error1', error1)
                                    else {
                                        if(req.query.ext == 'json' || req.query.ext == 'sql') {
                                            var result = csvjson.toObject(fs.readFileSync(path, 'utf8'))
                                            if(req.query.ext == 'json') {
                                                res.json(result)
                                            }
                                            else if(req.query.ext == 'sql') {
                                                var buffer = new Buffer(jsonToSQL(metadata.filename, result))
                                                res.set("Content-Disposition", 'attachment; filename="' + metadata.filename.split('.')[0]+ '.sql' + '"')
                                                res.send(buffer)
                                            }
                                        }
                                    }
                                }) 
                            }
                            else if(ext == 'json') {
                                var path = '/tmp/' + metadata.filename
                                var out = fs.createWriteStream(path)
                                readStream.pipe(out)

                                readStream.on('close', function(error1) {
                                    if(error1)
                                        console.log('error1', error1)
                                    
                                    if(req.query.ext == 'sql') {
                                        var buffer = new Buffer(jsonToSQL(metadata.filename, JSON.parse(fs.readFileSync(path, 'utf8'))))
                                        res.set("Content-Disposition", 'attachment; filename="' + metadata.filename.split('.')[0]+ '.sql' + '"')
                                        res.send(buffer)
                                    }
                                    
                                    else if(req.query.ext == 'csv') {
                                        var csvFile = metadata.filename.split('.')[0] + '.csv'

                                        res.set("Content-Disposition", 'attachment; filename="' + csvFile + '"')
                                        res.send(new Buffer(papa.unparse(JSON.parse(fs.readFileSync(path, 'utf8')))))
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
    
    app.get('/dashboard', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            UserModel.findOne({email:req.session.email}, function(err, user) {
                if(err)
                    console.log(err);
                fileMetadataModel.find({email: req.session.email}, function(err, metadata) {
                    if(err)
                        console.log(err) 
                    if(user.dateCreated < new Date('Wed Jul 12 2016 23:29:59 GMT+0000 (UTC)')) { //check if created before I started new TOS
                        res.render('dashboard', {user:user, metadata:metadata, showTOS:true})
                    }
                    else {
                        res.render('dashboard', {user:user, metadata:metadata, showTOS:false})
                    }
                })
            })
        } 
    }) 
    
    app.get('/store', function(req, res) {
        if(req.query.category) {
            fileMetadataModel.find({category: req.query.category}, function(err, metadata) {
                if(err)
                    console.log(err)
                res.render('store', {category:req.query.category.charAt(0).toUpperCase() + req.query.category.substring(1), metadata:metadata})
            })
        }
        else {
            res.render('store') // on cient-side, check if "category" exists
        }
    
    })
    
    app.post('/store', function(req, res) {
        fileMetadataModel.find({description: { "$regex": req.body.search, "$options": "i" }}, function(err, metadata) { //checks description
            if(err)
                console.log(err)
            if(metadata[0])
                res.render('store', {search:req.body.search, metadata:metadata})
            else {
                fileMetadataModel.find({title: { "$regex": req.body.search, "$options": "i" }}, function(err, metadata2) { //checks title
                    if(err)
                        console.log(err)
                    res.render('store', {search:req.body.search, metadata:metadata2})
                })
            }
        })
        
    })
    
    app.get('/blog', function(req, res) {
        res.redirect('https://medium.com/@34ndju')
    })

    app.get('/product/:id', function(req, res) {
        var tooLarge = false;
        if(req.query.tooLarge == 'true') 
            tooLarge = true;
            
        fileMetadataModel.findOne({_id:req.params.id}, function(err, metadata) {
            if(err)
                console.log(err)
                
            var headerStr = metadata.headers.join(', ')
            
            if(req.params.id == '576d50c430c66a5f0312cf9b') {
                var isOwner = false
                var isPurchased = true;
                res.render('product', {isPurchased:isPurchased, isOwner:isOwner, metadata:metadata, sample:false, headers: headerStr, tooLarge:tooLarge})
            }
            
            else {
                UserModel.findOne({email:req.session.email}, function(err, user) {
                    if(err)
                        console.log(err)
                        
                    var isOwner; //check if item belongs to current user's session
                    var isPurchased; //check if item is already purchased
                    
                    if(metadata.email == req.session.email) {
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
                        res.render('product', {isPurchased:isPurchased, isOwner:isOwner, metadata:metadata, sample:false, headers: headerStr, tooLarge:tooLarge});
                    }
                    else {
                        res.render('product', {isPurchased:isPurchased, isOwner:isOwner, metadata:metadata, sample:false, headers: headerStr, paymentError: req.query.paymentError.split('%20').join(' '), tooLarge: tooLarge});
                    }
                })
            }
        })
    })

    app.get('/totalremove/:id', function(req, res) {
        gridfs.remove({_id:req.params.id, email:req.session.email}, function(err) {
            if(err)
                console.log(err)
            else {
                fileMetadataModel.find({_id:req.params.id, email:req.session.email}).remove().exec()
                console.log(req.session.email + " removed file ID " + req.params.id);
                res.redirect('/')
            }
        })
    })
    
    app.get('/termsofuse', function(req, res) {
        res.render('termsofuse');
    })

    app.get('/medR', function(req, res) {
        res.redirect('/?utm_source=Medium&utm_medium=Blog&utm_campaign=Medium%20Blogs');
    })
    
    app.post('/pay', function(req, res) {
        var idString = req.body.id.replace(/['"]+/g, '')
        
        fileMetadataModel.findOne({_id:idString}, function(err, metadata) {  //because strings have "...."
            if(err)
                console.log(err)
                
            var token = req.body.token;
            
            var price = metadata.price * 100;
            var commission = Math.round(price * 0.15) 
            var toSeller = price - commission
            
            UserModel.findOne({email:metadata.email}, function(err, user) {
                if(err)
                    console.log(err)
                if(user.stripe){ //stripe already setup for seller
                    console.log('stripe exists')
                    stripe.charges.create(
                        {
                            amount: price, // amount in cents
                            currency: "usd",
                            source: token,
                            description: "Purchased " + metadata.title,
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
    
    app.get('/setPrice', function(req, res) {
        fileMetadataModel.findOne({email: req.session.email}, function(err, metadata) {
            res.render('setPrice', {metadata:metadata})
        })
    })
    
    app.post('/setPrice', function(req, res) {
        var price = parseInt(req.body.dollar) + (parseInt(req.body.cent) / 100)
        UserModel.findOne({email:req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            else {
                user.cart.push('price' + price)
                user.save()
                res.redirect('/')
            }
        })
    })
    
    app.get('/resetPassword', function(req, res) {
        res.render('resetPassword')
    })
    
    app.post('/resetPassword', function(req, res) {
        UserModel.findOne({email:req.body.email}, function(err, user) {
            if(err) {
                console.log(err)
                res.redirect('/resetPassword')
            }
            else {
                user.password = bcrypt.hashSync(req.body.password, 10)
                user.save()
                res.redirect('/')
            }
                
        })
    })
    
    app.get('/test', function(req, res) {
        res.render('test')
    })

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