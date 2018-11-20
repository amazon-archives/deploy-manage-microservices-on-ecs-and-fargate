[Back to main guide](../README.md)

___

# Clean Up

Congratulations on successfully completing the workshop. Time to clean up your environment.

___

## Clean-up CodePipeline

1. Delete the CloudWatch Event and Target.

```bash
aws events remove-targets \
--rule ecs-workshop-user-interface-service-codepipeline-event-rule \
--ids TargetCodePipeline

aws events delete-rule \
--name ecs-workshop-user-interface-service-codepipeline-event-rule
```

2. Delete the CodePipeline.

```bash
aws codepipeline delete-pipeline --name ecs-workshop-user-interface-service-codepipeline
```

3. Delete the CodeBuild Project.

```bash
aws codebuild delete-project --name ecs-workshop-user-interface-service-build-project
```

4. Delete all objects in the Artifact S3 Bucket.

```bash
# <PipleineArtifactBucket> - replace with value from ecs-workshop-ui-service-codepipeline CloudFormation Stack Output
aws s3 rm --recursive s3://<PipleineArtifactBucket>
```

5. Delete the ecs-workshop-ui-service-codepipeline CloudFormation Stack

```bash
aws cloudformation delete-stack --stack-name ecs-workshop-ui-service-codepipeline
```

___

## Clean-up ECS

1. Remove user-interface-service auto scaling CloudWatch alarms.

```bash
aws cloudwatch delete-alarms --alarm-names UIServiceScaleInAlarm UIServiceScaleOutAlarm
```

2. Stop and delete all ECS Services.

```bash
# user-interface-service
aws ecs update-service --cluster ecs-workshop-cluster --service user-interface-service --desired-count 0
aws ecs delete-service --cluster ecs-workshop-cluster --service user-interface-service

# user-profile-service
aws ecs update-service --cluster ecs-workshop-cluster --service user-profile-service --desired-count 0
aws ecs delete-service --cluster ecs-workshop-cluster --service user-profile-service

# contacts-service
aws ecs update-service --cluster ecs-workshop-cluster --service contacts-service --desired-count 0
aws ecs delete-service --cluster ecs-workshop-cluster --service contacts-service

# thumbnail-service
aws ecs update-service --cluster ecs-workshop-cluster --service thumbnail-service --desired-count 0
aws ecs delete-service --cluster ecs-workshop-cluster --service thumbnail-service
```

3. Deregister all ECS Task Definitions. Deregitering Task Definitions is easier from the ECS Console. You can select multiple revisions of a Task Definition and deregister them at once.

```bash
# user-interface-service
aws ecs list-task-definitions --family-prefix ecs-workshop-user-interface-service --query taskDefinitionArns
# repeat below command if you have multiple revisions
aws ecs deregister-task-definition --task-definition ecs-workshop-user-interface-service:<REVISION_NUMBER>

# user-profile-service
aws ecs list-task-definitions --family-prefix ecs-workshop-user-profile-service --query taskDefinitionArns
# repeat below command if you have multiple revisions
aws ecs deregister-task-definition --task-definition ecs-workshop-user-profile-service:<REVISION_NUMBER>

# contacts-service
aws ecs list-task-definitions --family-prefix ecs-workshop-contacts-service --query taskDefinitionArns
# repeat below command if you have multiple revisions
aws ecs deregister-task-definition --task-definition ecs-workshop-contacts-service:<REVISION_NUMBER>

# thumbnail-service
aws ecs list-task-definitions --family-prefix ecs-workshop-thumbnail-service --query taskDefinitionArns
# repeat below command if you have multiple revisions
aws ecs deregister-task-definition --task-definition ecs-workshop-thumbnail-service:<REVISION_NUMBER>
```

4. Delete the ECR repositories.

```bash
aws ecr delete-repository --force --repository-name ecs-workshop/user-interface-service
aws ecr delete-repository --force --repository-name ecs-workshop/user-profile-service
aws ecr delete-repository --force --repository-name ecs-workshop/contacts-service
aws ecr delete-repository --force --repository-name ecs-workshop/thumbnail-service
```

5. Delete the ecs-workshop-container-instances CloudFormation stack.

```bash
aws cloudformation delete-stack --stack-name ecs-workshop-container-instances
```

6. Delete the ECS Cluster.

```bash
aws ecs delete-cluster --cluster ecs-workshop-cluster
```
___

## Clean-up CloudWach Logs

1. Delete the CloudWatch Logs Groups we created for the ECS services.

```bash
# ECS Service Logs
aws logs delete-log-group --log-group-name ecs-workshop/user-interface-service
aws logs delete-log-group --log-group-name ecs-workshop/user-profile-service
aws logs delete-log-group --log-group-name ecs-workshop/contacts-service
aws logs delete-log-group --log-group-name ecs-workshop/thumbnail-service

# ECS Container Instance Logs
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/dmesg
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/docker
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/ecs/audit.log
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/ecs/ecs-agent.log
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/ecs/ecs-init.log
aws logs delete-log-group --log-group-name ecs-workshop-cluster-/var/log/messages
```

___

# Clean-up ALB Listener Rules

1. Delete the ALB Listener rules.

```bash
# Get the Rule ARNs
# <ALBListenerArn> - get value from ecs-workshop Cloudformation stack output
aws elbv2 describe-rules --listener-arn  "<ALBListenerArn>" \
--query 'Rules[*].{Arn:RuleArn,Default:IsDefault}'

# Repeat the Command below for multiple Rules except for rule where - Default:true
aws elbv2 delete-rule --rule-arn  <RULE-ARN>
```

___

## Clean-up the Image Bucket

1. Delete the Objets in the ImageS3Bucket

```bash
# <ImageS3BucketName> - get value from ecs-workshop Cloudformation stack output

aws s3 rm --recursive s3://<ImageS3BucketName>
```

___

## Clean-Up Cognito

1. Delete the Cognito User Pool Domain that your created in the [Configuring the Cognito User Pool](lab-setup.md#configuring-the-cognito-user-pool).

```bash
# <CognitoUserPoolId> - get value from ecs-workshop Cloudformation stack output
aws cognito-idp delete-user-pool-domain \
--domain <DOMAIN-NAME> \
--user-pool-id <CognitoUserPoolId>
```

13. Delete the ecs-workshop CloudFormation Stack.

```bash
aws cloudformation delete-stack --stack-name ecs-workshop 
```

___

[Back to main guide](../README.md)
