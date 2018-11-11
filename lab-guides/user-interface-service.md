[Back to main guide](../README.md)

___

# Build and deploy User-Interface-Service

In this section we will build and deploy **user-interface-service** as an ECS service using the **Fargate** deployment type. We will also setup **auto-scaling** for the service.

The ECS Task-Definition and Service-Definition are located in the user-interface-service folder.

___

## Task 1 - Build user-interface-service docker image

1. Navigate to the user-interface-service folder.

```bash
cd ../user-interface-service
```

2. Create ECR Repository for user-interface-service

```bash
# Note the repositoryUri and repositoryArn - output of below command
aws ecr create-repository --repository-name ecs-workshop/user-interface-service
```

3. Build the Docker Image and push it to ECR

```bash
docker build -t <repositoryUri>:latest .
```

4. Login to Elastic Container Registry (ECR)

```bash
aws ecr get-login --no-include-email | bash
```

5. Push the Docker image to ECR

```bash
docker push <repositoryUri>:latest
```

___

## Task 2 - Setup the ALB

You can create a listener with rules to forward requests based on the URL path. This is known as path-based routing. If you are running microservices, you can route traffic to multiple back-end services using path-based routing.

The Application Load Balancer(ALB), Listner and the necessary Target groups have been created by the ecs-workshop CloudFormation Stack deployed in the [Lab Setup](lab-guides/lab-setup.md) section. We will add rules to the ALB Listener to enable path-based routing to the user-interface-service.

```bash
# Refer to ecs-workshop CloudFormation stack output to get values of:
# <ALBListenerArn>
# <UserInterfaceServiceALBTargetGroupArn>

aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 1 \
--conditions Field=path-pattern,Values='/' \
--actions Type=forward,TargetGroupArn="<UserInterfaceServiceALBTargetGroupArn>"
```

Verify the ALB Listener rules have been created.

```bash
aws elbv2 describe-rules --listener-arn "<ALBListenerArn>"
```

___

## Task 3 - Deploy the user-interface-service as ECS Service

There are a few prerequisites for deploying an ECS service on Fargate. This involves creating a **Task Execution Role** and **Security Group**. A Security group is required as Fargate launch type uses the [awsvpc network mode](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-networking.html). The awsvpc network mode attaches an ENI (Elastic network interface) to the ECS task and hence needs a Security group to control the traffic flow. For tasks that use the Fargate launch type, the task execution role will need permissions to pull the container images from ECR and to write logs to CloudWatch logs.

1. The Security Group and Task Execution Role (FargateTaskExecutionRoleArn) were created by the ecs-workshop CloudFormation stack created in [Lab Setup](lab-setup.md#task-1-deploy-the-cloudformation-template) activity.

2. Create a CloudWatch LogGroup to collect user-interface-service.

```bash
aws logs create-log-group --log-group-name ecs-workshop/user-interface-service
```

3. In this step we will register the ECS Task Definition for the user-interface-service. A **task-definition.json** is located in the user-interface-service folder. Since we are deploying the user-interface-service on ECS Fargate, we have set the **requiresCompatibilities** to FARGATE and **networkMode** to awsvpc. FARGATE only supports awsvpc network mode.

Let us set the environment variables in the task-definition.json. Replace the following parameter placeholders in the task-definition.json file with appropriate values.

|Parameter                           | Value                                         |
|------------------------------------|-----------------------------------------------|
|&lt;FargateTaskExecutionRoleArn&gt; | ecs-workshop CloudFormation stack Output      |
|&lt;repositoryUri&gt;               | ECR repository Uri of user-interface-service  |
|&lt;AWS-REGION&gt;                  | AWS Region e.g. us-east-1                     |
|&lt;ImageS3BucketName&gt;           | ecs-workshop CloudFormation stack Output      |
|&lt;UserProfileDdbTable&gt;         | ecs-workshop CloudFormation stack Output      |
|&lt;ContactsDdbTable&gt;            | ecs-workshop CloudFormation stack Output      |
|&lt;CognitoUserPoolId&gt;           | ecs-workshop CloudFormation stack Output      |
|&lt;CognitoUserPoolClientId&gt;     | ecs-workshop CloudFormation stack Output      |
|&lt;CognitoIdentityPoolId&gt;       | ecs-workshop CloudFormation stack Output      |

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

4. We will now deploy the ECS service. Replace the following parameter place holders in the **service-definition.json**.

| Parameter                                   | Value                                    |
|---------------------------------------------|------------------------------------------|
|&lt;UserInterfaceServiceALBTargetGroupArn&gt;| ecs-workshop CloudFormation stack Output |
|&lt;PrivateSubnet1Id&gt;                     | ecs-workshop CloudFormation stack Output |
|&lt;PrivateSubnet2Id&gt;                           | ecs-workshop CloudFormation stack Output |
|&lt;UserInterfaceServiceSecurityGroupId&gt;  | ecs-workshop CloudFormation stack Output |

```bash
# Deploy the user-interface-service
aws ecs create-service --cli-input-json file://service-definition.json

# Verify the user-interface-service has been deployed successfully
# The command will wait till the service has been deployed.  No output is returned.
aws ecs wait services-stable \
--cluster ecs-workshop-cluster \
--services user-interface-service

# Verify the desired and running tasks for the service
aws ecs describe-services \
--cluster ecs-workshop-cluster \
--services user-interface-service \
--query 'services[0].{desiredCount:desiredCount,runningCount:runningCount,pendingCount:pendingCount}'
```

___

## Task 4 - Accessing the Contacts Management application

1. You can now access the application using ALB url. You can get the ALB URL from the CloudFormation Stack Output variable **ALBDNSName**.

2. Use the **Sign Up** link to register.

3. You will receive an email with a verification link to verify your account. Use the link in the email to verify your account.

4. Once the verification is complete, you can login to the application.

5. You can use the **Import CSV** button to import sample contacts into the application. Use the **sampleContacts.csv** file to load the sample contacts. 

___

[Back to main guide](../README.md)