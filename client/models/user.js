module.exports = function(mongoose, db) {
    
    var userSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        email: String,
        receiveEmail: Boolean,
        password: String,
        cart: Array,
        invited: Array,
        dateCreated: Date,
        stripe: Object,
        owed: Number
    });
    
    mongoose.model('user', userSchema);
    var UserModel = db.model('user');
    return UserModel;
}