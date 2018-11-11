// users.js
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

    app.get('/users', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/?message=unauthorized')
        } else {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(req.session.user.credJson);
        }
        res.locals.user = req.session.user
        getAllUsers(req, res, function() {
            return res.json({
                status: 'success'
            })
        });

    })
    // Submit form
    app.post('/users', (req, res) => {
        signUp(req, res);
        updateDDB(req, res);
    })

    app.post('/uploadURL', (req, res) => {
        uploadURL(req, res);
    })

    var signUp = function(req, res) {
        const data = req.body

        var poolData = {
            UserPoolId: config.aws_user_pools_id,
            ClientId: config.aws_user_pools_web_client_id
        };

        var userPool = new CognitoUserPool(poolData);

        var attributeList = [];

        var dataEmail = {
            Name: 'email',
            Value: data.email
        };
        var dataFirstName = {
            Name: 'given_name',
            Value: data.first_name
        };
        var dataLastName = {
            Name: 'family_name',
            Value: data.last_name
        };

        var attributeEmail = new CognitoUserAttribute(dataEmail);
        var attributeFN = new CognitoUserAttribute(dataFirstName);
        var attributeLN = new CognitoUserAttribute(dataLastName);
        attributeList.push(attributeEmail);
        attributeList.push(attributeFN);
        attributeList.push(attributeLN);

        userPool.signUp(data.email, data.password, attributeList, null, function(err, result) {
            if (err) {
                console.log("Error ", err);
                res.status(500).json({
                    status: 'error',
                    message: err.message
                })
            } else {
                var cognitoUser = result.user;
                res.json({
                    status: 'success',
                    message: cognitoUser.getUsername()
                })
                res.end()
            }
        });
    }

    var updateDDB = function(req, res) {
        const data = req.body

        // Initialize the Amazon Cognito credentials provider
        AWS.config.update({
            region: config.aws_region,
            //signatureVersion: config.signatureVersion,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.aws_cognito_identity_pool_id
            })
        });

        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-10-08'
        });
        var imageURL = 'default.jpeg';
        if (data.uploaded_image && data.uploaded_image != '') {
            imageURL = data.uploaded_image;
        }

        var user = {
            "Email": {
                "S": data.email
            },
            "FirstName": {
                "S": data.first_name
            },
            "LastName": {
                "S": data.last_name
            },
            "Profile_Img": {
                "S": imageURL
            },
            "TimeStamp": {
                "S": getDate()
            }
        };

        var params = {
            TableName: config.aws_dynamodb_table_name,
            Item: user
        };

        // Call DynamoDB to add the item to the table
        ddb.putItem(params, function(err, data) {
            if (err) {
                console.log("Error ", err);
            } else {
                // console.log("Success", data);
            }
        });
    }


    var getAllUsers = function(req, res, callback) {
        const data = req.body

        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-10-08'
        });

        var params = {
            TableName: config.aws_dynamodb_table_name,
        };

        // Call DynamoDB to add the item to the table
        ddb.scan(params, function(err, data) {
            if (err) {
                console.log("Error ", err);
            } else {
                var users = [];
                data.Items.forEach(function(user) {
                    users.push({
                        first_name: user.FirstName.S,
                        last_name: user.LastName.S,
                        email: user.Email.S,
                        profileImg: 'https://s3.dualstack.'+config.aws_region+'.amazonaws.com/' + config.aws_user_img_bucket + '/thmb/images/' + user.Profile_Img.S,
                        createdOn: user.TimeStamp.S
                    });
                });
                res.locals.users = users;
                req.session.users = users;
                callback();
            }
        });

    }

    var uploadURL = function(req, res) {

        AWS.config.update({
            region: config.aws_region,
            //signatureVersion: config.signatureVersion,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.aws_cognito_identity_pool_id
            })
        });

        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {
                Bucket: config.aws_user_img_bucket
            }
        });
        var key = "images/" + req.body.fileName;
        s3.getSignedUrl('putObject', {
            Bucket: config.aws_user_img_bucket,
            Expires: 60 * 60,
            Key: key,
            ContentType: req.body.contentType,
            ACL: 'public-read'
        }, function(err, url) {
            if (err) {
                console.log('Error  : ' + err);
                res.status(500).json({
                    status: 'error',
                    message: err.message
                })
            } else {
                res.json({
                    status: 'success',
                    bucketName: config.aws_user_img_bucket,
                    region: config.aws_region,
                    message: url
                })
                res.end()
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