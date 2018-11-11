[Back to main guide](../README.md)

___

## Task 2 - Setup path-based routing in ALB

You can create a listener with rules to forward requests based on the URL path. This is known as path-based routing. If you are running microservices, you can route traffic to multiple back-end services using path-based routing.

The Application Load Balancer(ALB), Listner and the necessary Target groups have been created by the CloudFormation Stack we created in the **Prerequistes** section of this lab. We will add rules to the ALB Listener to enable path-based routing to the respective backend microservices.

## Task 2.1 Create ALB Listener rules

1. Create ALB Listener rule for the user-interface service.

```bash
aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 1 \
--conditions Field=path-pattern,Values='/' \
--actions Type=forward,TargetGroupArn="<UserInterfaceServiceALBTargetGroupArn>"
```

2. Create ALB Listener rule for user-profile service paths.

```bash 
aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 2 \
--conditions Field=path-pattern,Values='/users' \
--actions Type=forward,TargetGroupArn="<UserProfileServiceALBTargetGroupArn>"

aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 3 \
--conditions Field=path-pattern,Values='/uploadURL' \
--actions Type=forward,TargetGroupArn="<UserProfileServiceALBTargetGroupArn>"
```

3. Create ALB Listener rule for contacts service paths.

```bash 
aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 4 \
--conditions Field=path-pattern,Values='/contacts' \
--actions Type=forward,TargetGroupArn="<ContactsServiceALBTargetGroupArn>"

aws elbv2 create-rule --listener-arn "<ALBListenerArn>" \
--priority 5 \
--conditions Field=path-pattern,Values='/impcsv' \
--actions Type=forward,TargetGroupArn="<ContactsServiceALBTargetGroupArn>"
```

4. Verify the ALB Listener rules have been created.

```bash
aws elbv2 describe-rules --listener-arn "<ALBListenerArn>"
```

___

[Back to main guide](../README.md)