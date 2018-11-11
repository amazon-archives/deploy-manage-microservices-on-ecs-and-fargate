[Back to main guide](../README.md)

___

# Create ECS Cluster and Container Instances

___

## Task 1 - Create ECS Cluster

Let us create an ECS Cluster and add Container Instances to the ECS Cluster

```bash
# Note the ECS Cluster Arn
aws ecs create-cluster --cluster-name ecs-workshop-cluster

# Let us check the number of Container Instances in the ECS Cluster.
# It will be 0, as we have not joined any Containter Instances to the Cluster we just created.
aws ecs describe-clusters \
--clusters ecs-workshop-cluster \
--query clusters[0].registeredContainerInstancesCount
```

___

## Task 2 - Deploy Container Instances

Launch EC2 Instances and join them to the above ECS cluster. We will be using CloudFormation template to deploy and configure the Container instances.

```bash
cd deploy-manage-microservices-on-ecs-and-fargate/

# Get the following values from ecs-workshop CloudFormation Stack output
# Replace the following parameter placeholders in the below command:
# <SSH-KEY-NAME> - SSH Key Pair name in your Environment
# <VpcId>, <PrivateSubnet1Id>, <PrivateSubnet2Id>, <AlbSecurityGroupId>

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

# Verify that stack creation is complete
aws cloudformation wait stack-create-complete \
--stack-name ecs-workshop-container-instances
```

Once the above CloudFormation Stack creation is complete, let us check the ECS cluster status to verify the number of Cluster Instances.

```bash
# Let us check the number of Container Instances in the ECS Cluster.
# It will now be 2
aws ecs describe-clusters \
--clusters ecs-workshop-cluster \
--query clusters[0].registeredContainerInstancesCount
```

___

[Back to main guide](../README.md)