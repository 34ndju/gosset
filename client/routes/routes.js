module.exports = function(express, app, session, papa, UserModel, d3, multiparty, fs, mongoose, db, path, excel, gridfs, pug, visitor, bcrypt) {
    
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
            res.redirect('/login')
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
                    //visitor.event("Login", "User Login").send()
                    console.log(email + " logged in.")
                    req.session.email = email;
                    res.redirect('/dashboard')
                }
                else {
                    res.redirect('/login?failed=true');
                }
            }
            else {
                res.redirect('/login?failed=true');
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

    app.get('/upload', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            UserModel.findOne({email:req.session.email}, function(err, user) {
                if(err)
                    console.log(err)
                res.render('upload', {cart:user.cart})
            })
        }
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
                var file = files.file[0]
                var ext = file.originalFilename.split('.')[1]
                if(ext == 'xlsx' || ext == 'xltx' || ext == 'xls' || ext == 'xlw' || ext == 'xml' || ext == 'csv') {
                    var writeStream = gridfs.createWriteStream({filename: file.originalFilename,
                                                                metadata: {
                                                                    email: req.session.email,
                                                                    title: fields.title[0],
                                                                    description: fields.description[0]
                                                                }
                    })
                    fs.createReadStream(file.path).pipe(writeStream)
                    writeStream.on('close', function(file) {
                        console.log(req.session.email + " uploaded " + file.originalFilename)
                        res.redirect('/')
                    })
                }
                else {
                    console.log(req.session.email + " uploaded the wrong filetype")
                    res.redirect('/dashboard')
                }
            }
        })
    })  
    
    app.get('/download/:id', function(req, res) {
        gridfs.findOne({_id: req.params.id}, function(err, file) {
            if(err)
                console.log(err)
            if(!file) {
                console.log("File not found");
                res.redirect('/')
            }
            else {
                res.set('Content-Type', file.contentType);
                res.set("Content-Disposition", 'attachment; filename="' + file.filename + '"')
    
                var readStream = gridfs.createReadStream({_id: file._id})
    
                readStream.on('error', function(err) {
                    console.log(err)
                })
     
                readStream.pipe(res)
                //visitor.event("Download", "Downloaded " + file.filename).send()
                console.log(req.session.email + " downloaded " + file.filename)
            }
        })
    })
    
    app.get('/mydataAPI', function(req, res) { 
        var files = {files: []}
        gridfs.files.find({"metadata.email": req.session.email}).toArray(function(err, data) {
            if(err)
                console.log(err)
            data.forEach(function(d) {
                files.files.push({title: d.metadata.title, id: d._id})
            })
            res.json(files)
        })
    }) //THIS ISS AN API
    
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
                    res.render('dashboard', {user:user, data:data})
                })
            })
        }
    }) 
    
    app.get('/store', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        UserModel.findOne({email:req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            res.render('store', {cart:user.cart})
        })
    })
    
    app.get('/storeAPI', function(req, res) {
        var f = {files: []}
        gridfs.files.find({}).toArray(function(err, files) {
            if(err)
                console.log(err)
            files.forEach(function(d) {
                f.files.push({title: d.filename, id: d._id})
            })
            res.json(f)
        })
        
    }) //THIS IS AN API
    
    app.get('/cart', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else
            res.sendFile(process.cwd() + '/client/html/cart.html')
    })
    
    app.get('/cartAPI', function(req, res) {
        var cart,
            data = []
    
        UserModel.findOne({email: req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            
            res.json({cart: user.cart})
        })
    })  //sends an array of user's cart. */
    
    app.get('/addtocart/:id/:title', function(req, res) {
        UserModel.findOne({email: req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            user.cart.push({id: req.params.id, title: req.params.title.replace(/_/g, " ")});
            user.save()
            res.redirect('/store')
        })
    })
    
    app.get('/product/:id', function(req, res) {
        if(!req.session.email)
            res.redirect('/login')
        else {
            gridfs.findOne({_id:req.params.id}, function(err, data) {
                if(err)
                    console.log(err)
                console.log(data)
                res.render('product', {data:data});
            })
        }
    })

    app.get('/accountinfoAPI', function(req, res) {
        UserModel.findOne({email: req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            res.json(user)
        })
    })  ///THIS IS AN API
    
    app.get("/removefromcart/:id", function(req, res) {
        UserModel.findOne({email: req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            for(var i=0; i<user.cart.length; i++) {
                if(user.cart[i].id == req.params.id) {
                    user.cart.splice(i, 1)
                    i--
                }
            }
            user.save()
            res.redirect('/cart')
        })
    })
    
    app.get("/removefromcartfrommydata/:id", function(req, res) {
        UserModel.findOne({email: req.session.email}, function(err, user) {
            if(err)
                console.log(err)
            if(user.cart.indexOf(req.params.id)>0) {
                user.cart.splice(user.cart.indexOf(req.params.id), 1)
                user.save()
            }
            res.redirect('/mydata')
        })
    }) //however, this only removes from the current user's cart??!!
    
    app.get('/totalremove/:id', function(req, res) {
        if(!req.session.email) {
            res.redirect('/login')
        }
        else {
            gridfs.remove({_id:req.params.id}, function(err) {
                if(err)
                    console.log(err)
                console.log(req.session.email + " removed file ID " + req.params.id);
                res.redirect('/')
            })
        }
    })
    
    app.get('/termsofuse', function(req, res) {
        res.render('termsofuse');
    })

}