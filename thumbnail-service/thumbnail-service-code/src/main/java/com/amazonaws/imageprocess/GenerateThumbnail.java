package com.amazonaws.imageprocess;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.CannedAccessControlList;

public class GenerateThumbnail {

	public void createThumbs(String filename, String bucketName) {
		String path = "thmb/";
		InputStream objectData = null;
		OutputStream outputStream = null;

		Thumbnail thumbnail = new Thumbnail();

		try {
			AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Config.getRegion()).build();

			S3Object s3Obj = s3.getObject(new GetObjectRequest(bucketName, filename));
			System.out.println("Content-Type: " + s3Obj.getObjectMetadata().getContentType());
			objectData = s3Obj.getObjectContent();

			byte[] thumnailData = thumbnail.createThumbnail(objectData, filename, 100);
			ObjectMetadata s3ObjectMetadata = new ObjectMetadata();
			s3ObjectMetadata.setContentLength(thumnailData.length);
			PutObjectRequest putobject = new PutObjectRequest(bucketName, path + filename, new ByteArrayInputStream(thumnailData), s3ObjectMetadata); 
			putobject.setCannedAcl(CannedAccessControlList.PublicRead);
			s3.putObject(putobject);

		} catch (AmazonS3Exception e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println(e);
		} finally {
			if (objectData != null) {
				try {
					objectData.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			if (outputStream != null) {
				try {
					// outputStream.flush();
					outputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}

			}
		}

	}

}
