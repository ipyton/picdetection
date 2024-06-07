import json
import boto3
import uuid

# Configure S3 client
s3 = boto3.client('s3')

def lambda_handler(event, context):
 # Get the bucket name from environment variable
 bucket_name = 'picdetectionbucket'
 key = f'{uuid.uuid4()}.png' # Generate a unique key for the object
 print(event)
 # Generate pre-signed URL
 presigned_url = s3.generate_presigned_url(
 ClientMethod='put_object',
 Params={
   'Bucket': bucket_name, 
   'Key': key,
   'ContentType': 'image/jpeg', # Set the Content-Type for .png
   'Metadata': {'email': event['email']}
 },
 ExpiresIn=3600, # The expiration time of the URL (in seconds), here it's set to 1 hour
 HttpMethod='PUT' # Only allow PUT requests on the url
 )

 # Construct the response
 response = {
   'statusCode': 200,
   'headers': {
   'Access-Control-Allow-Origin': '*'
   },
   'body': json.dumps({
   'presignedUrl': presigned_url,
   'key': key
   })
 }

 return response