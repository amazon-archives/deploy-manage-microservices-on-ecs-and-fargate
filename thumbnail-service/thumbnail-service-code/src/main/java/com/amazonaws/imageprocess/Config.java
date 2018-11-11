package com.amazonaws.imageprocess;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Config {
	
	private static Properties prop = null;
	
	static {
		  prop = new Properties();
		  InputStream in = Config.class.getResourceAsStream("config.properties");
		  try {
			prop.load(in);
			in.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			
		}
	}
	
	public static String getRegion() {
		if (prop != null) 
		 return  prop.getProperty("aws_region");
		else 
			return "us-east-1";
	}
	
//	public static String getSourceBucket() {
//		if (prop != null) 
//		 return  prop.getProperty("image_bucket");
//		else 
//			return null;
//	}
//	
//	public static String getThumbnailBucket() {
//		if (prop != null) 
//		 return  prop.getProperty("thumb_bucket");
//		else 
//			return null;
//	}
	
	public static String getSQSEndpoint() {
		if (prop != null) 
			 return  prop.getProperty("sqs_q_name");
			else 
				return null;
		
	}
	
}
