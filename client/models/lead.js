module.exports = function(mongoose, db) {
    
    var leadSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        organization: String,
        title: String,
        phone: String,
        email: String,
        address: String,
        city: String,
        state: String
    });
    
    mongoose.model('lead', leadSchema);
    var LeadModel = db.model('lead');
    return LeadModel;
}