module.exports = function(mongoose, db) {
    
    var fileMetadataSchema = new mongoose.Schema({
        email: String,
        title: String,
        description: String,
        filename: String,
        length: Number,
        uploadDate: Date,
        headers: Array,
        category: String,
        price: Number
    });
    
    mongoose.model('fileMetadata', fileMetadataSchema);
    var fileMetadataModel = db.model('fileMetadata');
    return fileMetadataModel;
}