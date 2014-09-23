var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// TODO: Not defined here
var site_prefix = "http://localhost:3000/api/v0/facilities/"

var SiteModel = new Schema({
        name: {
            type: String,
            required: true
        },
        
        // --- 09/22/2014 moved uuid and href to virtual,
        // uuid: {
        //     type: String,
        //     //required: true,
        //     default: ""
        // },
        // href: {
        //    type: String,
        //    required: true,
        // }, 
        active: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        coordinates: { 
            type: [Number], 
            index: '2dsphere'
        },
        properties: {
            type: {
                type: String
            },
            sector: {
                type: String
            },
            visits: Number,
            photoEndpoint: String,
            photoUrls: [String]
        }
    }, 
    // remove the unnecessary 'id' virtual field that mongoose adds
    { 
        id: false,
    }
);


// Create virtual for UUID from ID
SiteModel.virtual('uuid').get(function(){
    if (this._id)
        return this._id.toHexString();
});

// Create virtual for HREF from ID
SiteModel.virtual('href').get(function(){
    if (this._id)
        return site_prefix + this._id.toHexString() + ".json";
});

// Configure toObject
SiteModel.set('toObject', {
    virtuals: true
});

// Configure toJSON output
SiteModel.set('toJSON', {
    // Include virtuals with json output
    virtuals: true,

    // remove the _id of every document before returning the result
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

SiteModel.statics.findLimit = function(lim, off, callback) {
    return this.find({}).skip(off).limit(lim).exec(callback);
};

SiteModel.statics.findAll = function(callback) {
    return this.find({}, callback);
};

SiteModel.statics.findById = function(id, callback) {
    return this.find({"_id" : id}, callback);
}

SiteModel.statics.findNear = function(lng, lat, rad, earthRad, callback) {
    return this.find({ "coordinates": 
                        {"$geoWithin": 
                            { "$centerSphere": 
                                [   
                                    [lng, lat], rad / earthRad 
                                ]
                            }
                        }
                     }, callback);
}

SiteModel.statics.findWithin = function(swlat, swlng, nelat, nelng, callback) {
    return this.find({"coordinates": 
                        {"$geoWithin": 
                            { "$box": 
                                [ 
                                    [swlng, swlat],
                                    [nelng, nelat]
                                ]
                            }
                        }
                    }, callback);
}

SiteModel.statics.findWithinSector = function(swlat, swlng, nelat, nelng, sector, callback) {
    return this.find(
             {"$and": 
                [{"coordinates": 
                        {"$geoWithin": 
                            { "$box": 
                                [ 
                                    [swlng, swlat],
                                    [nelng, nelat]
                                ]
                            }
                        }
                    },
                 {"properties.sector": sector}]
             }, callback);
}

SiteModel.statics.updateById = function(id, site, callback) {
    return this.findByIdAndUpdate(id, {"$set": site }, callback);
}

SiteModel.statics.deleteById = function(id, callback) {
    return this.remove({"_id": id }, true).exec(callback);
}
exports.SiteModel = mongoose.model('SiteModel', SiteModel, 'facilities');
