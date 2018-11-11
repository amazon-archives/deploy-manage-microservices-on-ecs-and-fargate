[Back to main guide](../README.md)

___

# Setup auto scaling for User-Interface-Service

The process to create services that scale automatically has been made very easy, and is supported by the ECS console, CLI, and SDK. You choose the desired, minimum and maximum number of tasks, create one or more scaling policies, and Service Auto Scaling handles the rest. The service scheduler is also Availability Zone–aware, so you don’t have to worry about distributing your ECS tasks across multiple zones.

## Process overview

- Create CloudWatch Metrics.
- Register ECS service as a Scaling Target.
- Create Scaling Policy.
- Create CloudWatch Alarms.

## Setup auto scaling

The User-Interface-Service's desired capacity is currently set to 1. We will setup autoscaling with:

- minimum and desired capacity = 2
- maximum capacity = 2

### Steps

1. We will use the default ECS Service CloudWatch metric **CPUUtilization**.

2. Register the User-Interface-Service as an Application Auto Scaling target.

```bash
# Replace <EcsAutoscalingRoleArn> with value from ecs-workshop CloudFormation stack output
aws application-autoscaling register-scalable-target \
--service-namespace "ecs" \
--resource-id "service/ecs-workshop-cluster/user-interface-service" \
--scalable-dimension "ecs:service:DesiredCount" \
--min-capacity 2 \
--max-capacity 3 \
--role-arn "<EcsAutoscalingRoleArn>"
```

3. Configure the scale-out policy when the average ECS service CPU utilization is greater than 50% for 1 minute.

```bash
# Add Scale-Out Policy
# Note the PolicyARN - required for the next command
aws application-autoscaling put-scaling-policy \
--cli-input-json file://user-interface-service/service-scale-out-policy.json
```

```bash
# Scale Out Alarm - CPUUtilization > 50% for 1 minutes
aws cloudwatch put-metric-alarm \
--alarm-name "UIServiceScaleOutAlarm" \
--alarm-description "UI Service Scale-Out Alarm - CPU exceeds 50 percent" \
--metric-name "CPUUtilization" \
--namespace "AWS/ECS" \
--statistic "Average" \
--dimensions Name="ServiceName",Value="user-interface-service" Name="ClusterName",Value="ecs-workshop-cluster" \
--period 60 \
--evaluation-periods 1 \
--threshold 50.0 \
--comparison-operator GreaterThanOrEqualToThreshold \
--alarm-actions  "<PolicyARN from above command>"
```

4. Configure the scale-in policy when the average ECS service CPU utilization is less than 25% for 1 minute.

```bash
# Add Scale-In Policy
# Note the PolicyARN - required for the next command
aws application-autoscaling put-scaling-policy \
--cli-input-json file://user-interface-service/service-scale-in-policy.json
```

```bash
# Scale In Alarm - CPUUtilization < 25% for 1 minute
aws cloudwatch put-metric-alarm \
--alarm-name "UIServiceScaleInAlarm" \
--alarm-description "UI Service Scale-Out Alarm - CPU less than 25 percent" \
--metric-name "CPUUtilization" \
--namespace "AWS/ECS" \
--statistic "Average" \
--dimensions Name="ServiceName",Value="user-interface-service" Name="ClusterName",Value="ecs-workshop-cluster" \
--period 60 \
--evaluation-periods 1 \
--threshold 25.0 \
--comparison-operator LessThanOrEqualToThreshold \
--alarm-actions  "<PolicyARN from above command>"
```

5. Verify the ECS service now has 2 tasks running after the auto scaling has been setup.

```bash
aws ecs describe-services \
--cluster ecs-workshop-cluster \
--services user-interface-service \
--query 'services[*].{desiredCount:desiredCount, runningCount:runningCount}'
```

6. Now that the desired count has been set to 2. Let us now simulate load to test the autoscaling.

```bash
# Using Apache Bench to simulae load
# Replace <ALBDNSName> with Output value from the ecs-workshop CloudFormation Stack.
ab -n 300000 -c 1000 http://<ALBDNSName>/

# Wait for 2 minutes
# Open a new terminal and execute the below command to verify the desired count, which will now be set to 3
aws ecs describe-services \
--cluster ecs-workshop-cluster \
--services user-interface-service \
--query 'services[*].{desiredCount:desiredCount, runningCount:runningCount}'

```

___

[Back to main guide](../README.md)