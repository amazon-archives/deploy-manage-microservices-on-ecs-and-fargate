FROM node:8.11.3

# Environment Variables
# Set the following variables in Task-Definition Container-Definition
#  AWS_REGION
#  IMAGE_BUCKET_NAME
#  USER_PROFILE_DDB_TABLE_NAME
#  CONTACTS_DDB_TABLE_NAME
#  COGNITO_USER_POOL_ID
#  COGNITO_USER_POOL_CLIENT_ID
#  AWS_COGNITO_IDENTITY_POOL_ID

WORKDIR /usr/src/app
COPY contacts-service-code .
RUN npm i npm@latest -g && npm install

EXPOSE 3000
CMD sed -i "s/AWS_REGION/$AWS_REGION/" config/index.js && \
    sed -i "s/IMAGE_BUCKET_NAME/$IMAGE_BUCKET_NAME/" config/index.js && \
    sed -i "s/USER_PROFILE_DDB_TABLE_NAME/$USER_PROFILE_DDB_TABLE_NAME/" config/index.js && \
    sed -i "s/CONTACTS_DDB_TABLE_NAME/$CONTACTS_DDB_TABLE_NAME/" config/index.js && \
    sed -i "s/COGNITO_USER_POOL_ID/$COGNITO_USER_POOL_ID/" config/index.js && \
    sed -i "s/COGNITO_USER_POOL_CLIENT_ID/$COGNITO_USER_POOL_CLIENT_ID/" config/index.js && \
    sed -i "s/AWS_COGNITO_IDENTITY_POOL_ID/$AWS_COGNITO_IDENTITY_POOL_ID/" config/index.js && \
    npm start