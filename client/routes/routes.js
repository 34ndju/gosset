module.exports = function(express, app, session, papa, UserModel, CSVModel, d3, multiparty, fs, mongoose, db, path, excel) {
    
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
            res.redirect('/login')
        }
    })
    
    app.post('/login', function(req, res) {
        var email = req.body.email;
        var password = req.body.password;
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
                res.redirect('/dashboard')
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
        var newUser = new UserModel();
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.email = email;
        newUser.password = password;
        newUser.save(function(err, saved) {
            if(err)
                throw err;
            else {
                req.session.email = email;
                res.sendFile(process.cwd() + '/client/html/myaccount.html');
            }
        });
    }); 
    
    app.get('/data', function(req, res) {
        
        res.sendFile(process.cwd() + '/client/html/data.html') 
        
    }); 
    
    app.get('/dataAPI', function(req, res) {
        if(true) {
            var email = '34ndju@gmail.com';
            CSVModel.findOne({title: "test one"}, function(err, data) {
                if(err)
                    console.log(err)
                res.json(data)
            })
        }
        else {
            res.status(401).send('Error 401: Not authorized')
        }
    }) //THIS IS AN API
    
    app.get('/upload', function(req, res) {
        if(true) {
            res.sendFile(process.cwd() + '/client/html/upload.html')
        }
        else {
            res.status(401).send("Error 401: Not authorized")
        }
    })
    
    app.post('/upload', function(req, res) {
        var newCSV = new CSVModel()
        var form = new multiparty.Form()
        
        form.parse(req, function(err, fields, files) {
            if(err)
                console.log(err);
            
            var file = files.file[0],
                ext = file.originalFilename.split('.').pop()
                
            
            fs.readFile(file.path, 'utf-8', function(err, data) {
                if(err)
                    console.log(err);
                
                if(ext == "xlsx") {
                    var results = [],
                        keys = []
                    excel(file.path, function(err, data) {
                        if(err) 
                            console.log(err)
                        
                        data[0].forEach(function(d) {
                            keys.push(d)
                        })
                        
                        for(var i = 1; i < data.length; i++) {
                            var newObj = {}
                            for(var x = 0; x < keys.length; x++)  {
                                newObj[keys[x]] = data[i][x]
                            }
                            results.push(newObj)
                        }
                        
                        //adding to mongo
                        newCSV.email = req.session.email
                        newCSV.data = results;
                        newCSV.save()
                        req.session.dataid = newCSV._id
                        res.redirect('/upload2')
                    }); 
                }
            
                else if(ext == "csv") {
                    var results = papa.parse(data, {
                        header: true
                    }).data
                    
                    //adding to mongo
                    newCSV.email = req.session.email
                    newCSV.data = results;
                    newCSV.save()
                    req.session.dataid = newCSV._id
                    res.redirect('/upload2')
                }
            }) 
        })
    })  //supports .xlsx and .csv
    
    app.get('/upload2', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/upload2.html')
    }) 
    
    app.post('/upload2', function(req, res) {
        var title = req.body.title
        var id = req.session.dataid
        CSVModel.findOne({"_id": id}, function(err, data) {
            if(err)
                console.log(err)
            data.title = title;
            data.fileName = title.replace(/\s/g, '') + '.csv'
            data.save()
        })
        res.redirect('/upload')
    })

    app.get('/download/:id', function(req, res) {
        var path = process.cwd() + "/server/tempdata/"
        
        CSVModel.findOne({_id: req.params.id}, function(err, data) {
            if(err)
                console.log(err)
            var name = data.fileName
            data = data["data"];
            var csv = papa.unparse(data);
            fs.writeFile(path + name, csv, function(err) {
                if(err)
                    console.log(err)
                    
                res.download(path + name, name, function(err) {
                    if(!err)
                        fs.unlink(path + name, function(err) {
                            if(err)
                                console.log(err)
                        })
                })
            })
        })
    })  //previously get /csv/:id
    
    app.get('/myaccount', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/myaccount.html');
    })
    
    app.get('/mydataAPI', function(req, res) { 
        var files = {files: []}
        CSVModel.find({email: req.session.email}, function(err, data) {
            if(err)
                console.log(err)
            data.forEach(function(d) {
                files.files.push({title: d.title, id: d._id})
            })
            res.json(files)
        })
    }) //THIS IS AN API
    
    app.get('/mydata', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/myfiles.html');
    })
    
    app.get('/dashboard', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/myaccount.html');
    }) 
    
    app.get('/store', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/store.html')
    })
    
    app.get('/storeAPI', function(req, res) {
        var files = {files: []}
        CSVModel.find({}, function(err, data) {
            if(err)
                console.log(err)
            data.forEach(function(d) {
                files.files.push({title: d.title, id: d._id})
            })
            res.json(files)
        })
    }) //THIS IS AN API
    
    app.get('/cart', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/cart.html')
    })
    
    app.get('/cartAPI', function(req, res) {
        var cart,
            data = []
    
        UserModel.findOne({email: '34ndju@gmail.com'/*req.session.email*/}, function(err, user) {
            if(err)
                console.log(err)
            
            res.json({cart: user.cart})
        })
    })  //sends an array of user's cart.
    
    app.get('/addtocart/:id/:title', function(req, res) {
        UserModel.findOne({email: "34ndju@gmail.com"/*req.session.email*/}, function(err, user) {
            if(err)
                console.log(err)
            user.cart.push({id: req.params.id, title: req.params.title.replace(/_/g, " ")});
            user.save()
            res.redirect('/store')
        })
    })
    
    app.get('/productAPI', function(req, res) {
        CSVModel.findOne({_id: req.session.currentProduct}, function(err, data) {
            if(err)
                console.log(err)
            res.json(data)
        })
    }) //THIS IS AN API
    
    app.get('/product/:id', function(req, res) {
        req.session.currentProduct = req.params.id;
        res.redirect('/product')
    })
    
    app.get('/product', function(req, res) {
        res.sendFile(process.cwd() + '/client/html/product.html')
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
            for(var i=0; i<user.cart.length; i++) {
                if(user.cart[i].id == req.params.id) {
                    user.cart.splice(i, 1)
                    i--
                }
            }
            user.save()
            res.redirect('/mydata')
        })
    })
    
    app.get('/totalremove/:id', function(req, res) {
        CSVModel.findOne({_id: req.params.id}, function(err, data) {
            if(err)
                console.log(err)
            res.redirect('/removefromcartfrommydata/' + req.params.id)
        }).remove().exec()
    })
}