module.exports = function(mongoose, db) {
    
    var userSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        cart: Array
    });
    
    mongoose.model('user', userSchema);
    var UserModel = db.model('user');
    return UserModel;
}