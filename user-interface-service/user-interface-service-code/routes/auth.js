// auth.js

import async from 'async'
import _ from 'lodash'
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

    app.get('/userspage', (req, res) => {
        res.locals.user = req.session.user;
        res.locals.users = req.session.users;
        return res.render('users.html', {
            partials
        })
    });
    app.get('/signup', (req, res) => {
        return res.render('signup.html', {
            partials
        })
    });
    app.get('/contactspage', (req, res) => {
        res.locals.user = req.session.user;
        res.locals.users = req.session.users;
        return res.render('contacts.html', {
            partials
        })
    });
    app.get('/unauthorizedpage', (req, res) => {
        return res.render('/?message=unauthorized', {
            partials
        })
    });

    // Submit form
    app.post('/auth', (req, res) => {
        const data = req.body
        req.session.loginurl = data.homeurl;

        handleSignIn(req.body.email, req.body.password, {
            onSuccess: function(result) {
                let credJson = {};
                let Login = {};

                const loginCred = 'cognito-idp.' + config.aws_region + '.amazonaws.com/' + config.aws_user_pools_id;
                Login[loginCred] = result.getIdToken().getJwtToken();
                credJson['IdentityPoolId'] = config.aws_cognito_identity_pool_id;
                credJson['Logins'] = Login;

                AWS.config.credentials = new AWS.CognitoIdentityCredentials(credJson);
                AWS.config.credentials.refresh((error) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Successfully logged!');
                    }
                });
                getLogedUser(req, res, credJson, function(req, res) {
                    req.session.save();
                    return res.json({
                        status: 'success'
                    })
                });
            },
            onFailure: function(err) {
                console.log("-----> In onFailure" + err);
                return res.status(404).json({
                    status: 'error',
                    message: 'This user was not found or the email and password are incorrect.'
                })
            },
        });
    });

    function getLogedUser(req, res, credJson, callback) {
        const data = req.body

        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-10-08'
        });

        var params = {
            TableName: config.aws_dynamodb_table_name,
            Key: {
                "Email": {
                    "S": data.email
                }
            }
        };

        // Call DynamoDB to add the item to the table
        ddb.getItem(params, function(err, data) {
            if (err) {
                console.log("Error ", err);
            } else {
                req.session.user = {
                    last_name: data.Item.LastName.S,
                    email: data.Item.Email.S,
                    first_name: data.Item.FirstName.S,
                    profileImg: 'https://s3.amazonaws.com/' + config.aws_user_img_bucket + '/thmb/images/' + data.Item.Profile_Img.S,
                    credJson : credJson
                }
                req.session.save();
                callback(req, res);
            }
        });
    }

    function handleSignIn(username, password, callbacks) {

        var poolData = {
            UserPoolId: config.aws_user_pools_id,
            ClientId: config.aws_user_pools_web_client_id
        };

        var userPool = new CognitoUserPool(poolData);

        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool
        });

        cognitoUser.authenticateUser(authenticationDetails, callbacks);

    }
}