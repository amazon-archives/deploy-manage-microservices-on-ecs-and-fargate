// contacts.js
import async from 'async'
import AWS, {
    Config,
    CognitoIdentityCredentials
} from 'aws-sdk';
import {
    CognitoUserPool,
    CognitoUserAttribute,
    AuthenticationDetails,
    CognitoUser
} from 'amazon-cognito-identity-js';

module.exports = (app, config, partials) => {
    AWS.config.region = config.aws_region;

    app.get('/', function(req, res) {
        return res.json({
            status: 'success'
        })
    });

    app.get('/contacts', (req, res) => {
        loadContact(req, res);
    })

    app.post('/contacts', (req, res) => {
        loadContact(req, res);
    });

    var loadContact = function(req, res) {
        console.log("Entering load contacts ");
        if (!req.session.user) {
            console.log(" Unable to find user in session ");
            return res.json({
                status: 'error'
            })
        } else {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(req.session.user.credJson);
        }

        res.locals.user = req.session.user
        getAllContacts(req, res, function() {
            console.log("Exiting load contacts ");
            return res.json({
                status: 'success'
            })
        });
    }

    var getAllContacts = function(req, res, callback) {
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-10-08'
        });

        var params = {
            TableName: config.aws_ddb_contact_table_name,
            ExpressionAttributeValues: {
                ':s': {
                    S: req.session.user.email
                }
            },
            KeyConditionExpression: 'user_id = :s '
        };
        // Call DynamoDB to add the item to the table
        ddb.query(params, function(err, data) {
            if (err) {
                console.log("Error ", err);
            } else {
                var users = [];
                data.Items.forEach(function(user) {
                    users.push({
                        first_name: user.first_name.S,
                        last_name: user.second_name.S,
                        email: user.email.S,
                        profileImg: 'https://s3.amazonaws.com/' + config.aws_contact_img_bucket + '/thmb/images/' + user.image.S,
                        phno: user.phonenumber.S,
                        createdOn: user.created_on.S,
                        unique_id: user.unique_id.S
                    });
                });
                req.session.users = users;
                //res.locals.users = users;
                callback();
            }
        });
        return res.locals.users;
    }
}