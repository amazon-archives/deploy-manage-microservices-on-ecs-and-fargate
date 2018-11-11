[Back to main guide](../README.md)

___

# Create a CodePipeline for the User-Interface service

We will now set up CI/CD for the **user-interface-service** using [AWS CodePipeline](https://aws.amazon.com/codepipeline/). The CodePipeline will be triggered whenever we push code changes to the [AWS CodeCommit](https://aws.amazon.com/codecommit/) repository. The CodePipeline will build the Docker image, push the new image to ECR and finally update the user-interface-service on ECS.

___

## Task 1 - Create the CodePipeline prerequisite stack

In this task we will deploy a CloudFormation template to create the AWS resources required for setting-up a CodePipeline. The AWS resources created by the stack include:

- CodeCommit Repository
- IAM Roles and Policies required by CodePipeline and CodeBuild
- CodePipeline artifact S3 Bucket

```bash
cd ../

# Replace <user-interface-service repositoryArn> - user-interface-service ECR Repository ARN
aws cloudformation create-stack \
--stack-name ecs-workshop-ui-service-codepipeline \
--template-body file://cfn-templates/codepipeline-prereq-cfn-template.yaml \
--capabilities CAPABILITY_IAM \
--parameters \
ParameterKey="EcrRepositoryArn",ParameterValue="<user-interface-service repositoryArn>"
```

___

## Task 2 - Create the CodeBuild Project

The CloudFormation stack created at the begining of the section created the prerequisites for the CodeBuild Project. The prerequisites include:

- **CodePipeline Artifact S3 Bucket** - The CodeBuild output artifact is stored in this S3 Bucket.
- **CodeBuild CloudWatch Log Group** - CodeBuild project build logs are sent to this Log Group.
- **IAM Service Role for CodeBuild** - CodeBuild will need IAM permission to pull the image from ECR, put the build artifact to the Artifact S3 Bucket and write build logs to CloudWatch Logs.

A **buildspec.yml** file is located in the **user-interface-service** folder. This file provides the build instructions to the CodeBuild service.

Create the CodeBuild project. Edit the **codepipeline/codebuild-project.json** file to replace the following Parameters.

| Parameter                                   | Value                                                            |
|---------------------------------------------|------------------------------------------------------------------|
|&lt;CodeBuildServiceRoleArn&gt;              | ecs-workshop-ui-service-codepipeline CloudFormation stack Output |
|&lt;user-interface-service repositoryUri&gt; | user-interface-service ECR repository URI                        |

```bash
cd ./codepipeline
aws codebuild create-project --cli-input-json file://codebuild-project.json
```

___

## Task 3 - Push the user-interface-service to CodeCommit repository

In this task let us push an initial commit of the user-interface-service code to the CodeCommit Repository.

1. Configure [SSH access](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-unixes.html#setting-up-ssh-unixes-keys) to your CodeCommit repository.

2. Clone the empty CodeCommit repository

```bash
cd ../..

git clone ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/ecs-workshop-user-interface-service
```

3. Copy the contents of the user-interface-service to the cloned folder.

```bash
cp -Rpv deploy-manage-microservices-on-ecs-and-fargate/user-interface-service/* ecs-workshop-user-interface-service/
```

4. Push the initial commit to the CodeCommit repository.

```bash
cd ecs-workshop-user-interface-service/

# Config Git details
git config --local user.name "<YOUR-NAME>"
git config --local user.email "<YOUR-EMAIL>"

# Commit & push
git add *
git commit -m "Initial commit"
git push
```

___

## Task 4 - Create the CodePipeline

Now that we have the CodeCommit repository and CodeBuild project let us now create the CodePipeline. The CodePipeline will have 3 stages:
- **Source** - CodeCommit Repository
- **Build** - CodeBuild Project that will build the Docker image and push it to ECR.
- **Deploy** - This stage updates the ECS service **user-interface-service**

Create the CodePipeline.  Edit the **codepipeline/codepipeline.json** file to replace the following Parameters.

| Parameter                         | Value                                                            |
|-----------------------------------|------------------------------------------------------------------|
|&lt;CodePipelineServiceRoleArn&gt; | ecs-workshop-ui-service-codepipeline CloudFormation stack Output |
|&lt;PipleineArtifactBucket&gt;     | user-interface-service ECR repository URI                        |

```bash
cd ../deploy-manage-microservices-on-ecs-and-fargate/codepipeline
aws codepipeline create-pipeline --cli-input-json file://codepipeline.json
```

Login to the AWS Console and navigate to the CodePipeline console to monitor the status of the CodePipeline.

___

## Task 5 - Create the CloudWatch Event to trigger CodePipeline on code change

A **CloudWatch Event Rule** is needed to trigger the CodePipeline whenever the source code changes in the CodeCommit repository. In this task we will create the CloudWatch Event Rule to trigger the CodePipeline we created in the previous task.

1. Create a CloudWatch Event Rule that will be triggered when there is a change in the CodeCommit repository.

```bash
# <CodeCommitRepoArn> - get value from ecs-workshop-ui-service-codepipeline CloudFormation stack output

aws events put-rule \
--name ecs-workshop-user-interface-service-codepipeline-event-rule \
--description "CloudWatch Events rule to automatically start your pipeline when a change occurs in the ecs-workshop-user-interface-service CodeCommit repository" \
--state ENABLED \
--event-pattern \
"{
    \"source\": [\"aws.codecommit\"],
    \"detail-type\": [\"CodeCommit Repository State Change\"],
    \"resources\": [\"<CodeCommitRepoArn>\"],
    \"detail\": {
        \"event\": [\"referenceCreated\",\"referenceUpdated\"],
        \"referenceType\": [\"branch\"],
        \"referenceName\": [\"master\"]
    }
}"
```

2. Create a CloudWatch Event Target for the above CloudWatch Event Rule. The target will be the CodePipeline we created.

```bash
# get the ARN of the CodePipeline
aws codepipeline get-pipeline --name ecs-workshop-user-interface-service-codepipeline --query metadata.pipelineArn
```

```bash
# Replace <CodePipeline ARN>
# Replace <EventsServiceRoleArn> - get value from ecs-workshop-ui-service-codepipeline CloudFormation stack output
aws events put-targets \
--rule ecs-workshop-user-interface-service-codepipeline-event-rule \
--targets \
"Id"="TargetCodePipeline",\
"Arn"="<CodePipeline ARN>",\
"RoleArn"="<EventsServiceRoleArn>"
```

___

## Task 6 - Push a change to CodeCommit repository to trigger the CodePipeline

Now that we have configured the CloudWatch Event rule and target, let us push a change to the CodeCommit repository and verify that our CodePipeline is triggered. We will change the the login button text.

1. To change button text edit the file **ecs-workshop-user-interface-service/user-interface-service/user-interface-service-code/views/index.html** as shown below.

```html
# FROM
<button class="btn btn-lg btn-primary btn-block submit-btn" type="submit">Log in</button>

# TO
<button class="btn btn-lg btn-primary btn-block submit-btn" type="submit">Sign in</button>
```

2. Push the updated code to CodeCommit Repository.

```bash
cd ../../ecs-workshop-user-interface-service/

git add *
git commit -m "changed login button text and color"
git push
```

3. Navigate to the CodePipeline Console to monitor your pipeline.

4. Once the deployment is complete, you can verify the Log in page of the application.

___

[Back to main guide](../README.md)