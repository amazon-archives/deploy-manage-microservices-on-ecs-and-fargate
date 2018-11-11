/*
 * Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

package com.amazonaws.imageprocess;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;

public class SQSQueuePoller {

	public static void main(String[] args) throws Exception {

		System.out.println("Connecting to SQS");

		AmazonSQS sqs = AmazonSQSClientBuilder.standard().withRegion(Config.getRegion()).build();

		try {
			while (true) {
				System.out.println("Receiving messages from queue : " + Config.getSQSEndpoint());
				ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest()
						.withQueueUrl(Config.getSQSEndpoint()).withWaitTimeSeconds(20);
				List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
				System.out.println(" Message count : " + messages.size());
				if (messages.size() > 0) {
					for (Message message : messages) {
						JSONObject obj = new JSONObject(message.getBody());
						System.out.println(" JSONObject : " + obj.toString());
						try {
							JSONArray records = obj.getJSONArray("Records");
							if (records != null) {
								JSONObject bigO = records.getJSONObject(0);
								JSONObject s3 = bigO.getJSONObject("s3");
								JSONObject ob = s3.getJSONObject("object");
								JSONObject bucket = s3.getJSONObject("bucket");
								new GenerateThumbnail().createThumbs(ob.getString("key"), bucket.getString("name"));

							}
						} catch (Exception e) {
							sqs.deleteMessage(
									new DeleteMessageRequest(Config.getSQSEndpoint(), message.getReceiptHandle()));

						}
						// Delete a message
						System.out.println("Deleting a message.\n");

						sqs.deleteMessage(
								new DeleteMessageRequest(Config.getSQSEndpoint(), message.getReceiptHandle()));
					}
				}
				Thread.sleep(30000);
			}
		} catch (AmazonS3Exception e) {
			e.printStackTrace();
		} catch (Exception err) {
			System.out.println("Error Message: " + err.getMessage());
			err.printStackTrace();
		}
	}
}
