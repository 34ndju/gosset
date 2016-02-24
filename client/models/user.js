module.exports = function(mongoose) {
    mongoose.connect('mongodb://localhost/base');
    
    var userSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        address: String
    });
    
    var UserModel = mongoose.model('guests', userSchema);
    return UserModel;
}