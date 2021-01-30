const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Document = new Schema({
    owner: {
        type: Schema.ObjectId,
        ref: 'users',
        required: true,
        username: {
            type: String,
            required:true
        },
        
    },
    memberList: {
        type: [{
            type: Schema.ObjectId,
            ref: 'users',
            username: {
                type: String,
                required: true
            },
        }],
        default: [],
    },
    content: {
        type: Array,
        default: [],
    },
    title: {
        type: String,
        default: 'Untitled',
    },
    createdAt: {
        type: Date,
    },
    editedAt: {
        type: Date
    }
});

var Document_model = mongoose.model('Document', Document);

module.exports = Document_model