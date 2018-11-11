FROM ubuntu:17.10

# Environment Variables
# Set the following variables in Task-Definition Container-Definition
# AWS_REGION
# SQS_QUEUE_URL

WORKDIR /opt/thumbnail-service
COPY thumbnail-service-code .

# Compile the Application
RUN apt update && \
    apt install -y openjdk-8-jdk maven && \
    mvn clean install

CMD sed -i "s,AWS_REGION,$AWS_REGION,g" target/classes/com/amazonaws/imageprocess/config.properties && \
    sed -i "s,SQS_QUEUE_URL,$SQS_QUEUE_URL,g" target/classes/com/amazonaws/imageprocess/config.properties && \
    mvn exec:java -Dexec.mainClass="com.amazonaws.imageprocess.SQSQueuePoller"
