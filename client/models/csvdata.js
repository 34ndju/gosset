module.exports = function(mongoose, db) {
    var dataSchema = {
        email: String,
        data : Array,
        fileName: String,
        title: String
    }
    
    mongoose.model('data', dataSchema);
    var DataModel = db.model('data');
    return DataModel;
}