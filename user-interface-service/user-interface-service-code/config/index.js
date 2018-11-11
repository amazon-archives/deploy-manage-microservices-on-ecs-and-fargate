// config

const config = {
	aws_region: 'AWS_REGION',
	aws_user_img_bucket: 'IMAGE_BUCKET_NAME',
	aws_contact_img_bucket: 'IMAGE_BUCKET_NAME',
	aws_dynamodb_table_name: 'USER_PROFILE_DDB_TABLE_NAME',
	aws_ddb_contact_table_name: 'CONTACTS_DDB_TABLE_NAME', 
	aws_user_pools_id: 'COGNITO_USER_POOL_ID',
	aws_user_pools_web_client_id: 'COGNITO_USER_POOL_CLIENT_ID',
	aws_cognito_identity_pool_id: 'AWS_COGNITO_IDENTITY_POOL_ID',
	signatureVersion: 'v4'
}
module.exports = config