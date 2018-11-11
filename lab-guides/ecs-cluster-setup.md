[Back to main guide](../README.md)

___

# Task 1 - Create ECS Cluster and Container Instances

1. Let us create an ECS Cluster and add Container Instances to the ECS Cluster

```bash
# Note the ECS Cluster Arn
# Check the value of registeredContainerInstancesCount. It'll be 0 as there are no Container Instances in the ECS-Cluster.

aws ecs create-cluster --cluster-name ecs-workshop-cluster
```

2. Launch EC2 Instances and join them to the above ECS cluster. We will be using CloudFormation template to deploy and configure the Container instances.

```bash
# Get the following values from ecs-workshop CloudFormation Stack output
# <VpcId>, <AlbSecurityGroupId>, <PrivateSubnet1Id>, <PrivateSubnet2Id>

aws cloudformation create-stack \
--stack-name ecs-workshop-container-instances \
--template-body file://cfn-templates/container-instances-template.yaml \
--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
--parameters \
ParameterKey="SshKeyName",ParameterValue="<SSH-KEY-NAME>" \
ParameterKey="ECSClusterName",ParameterValue="ecs-workshop-cluster" \
ParameterKey="ECSClusterSize",ParameterValue=2 \
ParameterKey="VpcId",ParameterValue="<VpcId>" \
ParameterKey="PrivateSubnet1Id",ParameterValue="<PrivateSubnet1Id>" \
ParameterKey="PrivateSubnet2Id",ParameterValue="<PrivateSubnet2Id>" \
ParameterKey="AlbSecurityGroupId",ParameterValue="<AlbSecurityGroupId>"
```

3. Once the above CloudFormation Stack creation is complete, let us check the ECS cluster status to verify the number of Cluster Instances.

```bash
# Check the value of registeredContainerInstancesCount.

aws ecs describe-clusters --clusters ecs-workshop-cluster
```

___

[Back to main guide](../README.md)