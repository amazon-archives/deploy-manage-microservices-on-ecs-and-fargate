// impcsv.js
import async from 'async'
import multer from 'multer'
import csv from "fast-csv"
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
var upload = multer();

module.exports = (app, config, partials) => {
    AWS.config.region = config.aws_region;

    app.post('/impcsv', upload.single('uploadCsv'), (req, res) => {
        const data = req.session;

        if (!req.session.user) {
            return res.redirect('/?message=unauthorized')
        } else {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(req.session.user.credJson);
        }

        var userId = req.session.user.email;
        var csvData = req.file.buffer.toString('utf8');

        var items = [];
        csv.fromString(csvData, {
            headers: true,
            trim: true
        }).on("data", function(data) {
            items.push({
                PutRequest: {
                    Item: {
                        "user_id": {
                            S: userId
                        },
                        "unique_id": {
                            S: guid()
                        },
                        "first_name": {
                            S: data.first_name
                        },
                        "second_name": {
                            S: data.second_name
                        },
                        "email": {
                            S: data.email
                        },
                        "phonenumber": {
                            S: data.phno
                        },
                        "image": {
                            S: data.img
                        },
                        "created_on": {
                            S: getDate()
                        }
                    }
                }
            });
        }).on("end", function() {
            insertContacts(req, res, items, function() {
                return res.send({
                    status: 'success'
                })
            })
        });
    })

    var guid = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    var insertContacts = function(req, res, items, callback) {
        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-10-08'
        });

        let params = {};
        let TABLE = {};

        const tableName = config.aws_ddb_contact_table_name;
        TABLE[tableName] = items;
        params['RequestItems'] = TABLE;


        // Call DynamoDB to add the item to the table
        ddb.batchWriteItem(params, function(err, data) {
            if (err) {
                console.log("Error ", err);
            } else {
                callback();
                // getAllUsers(req, res, callback);
            }
        });
    }

    var getDate = function() {
        var date = new Date();
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + '-' + (monthIndex + 1) + '-' + year;
    }
}