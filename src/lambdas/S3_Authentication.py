import json
import boto3
from botocore.exceptions import ClientError
from base64 import b64encode

# Initialize AWS services clients
dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')

# DynamoDB table name
table_name = 'picdetection'

def lambda_handler(event, context):
    try:
        # Extract email and image URL from the event
        email = event['queryStringParameters']['email']
        image_url = event['queryStringParameters']['image_url']
        
        # Log the received parameters
        print(f"Received email: {email}")
        print(f"Received image_url: {image_url}")

        # Determine the attribute name based on the image URL
        if 'picdetectionthumbnail' in image_url:
            # For thumbnail URLs, use the thumbnailURL attribute
            url_attribute = 'thumbnailURL'
        elif 'picdetectionbucket' in image_url:
            # For raw URLs, we need to query based on email and rawURL
            # This part will be handled separately as rawURL is not a sort key
            url_attribute = 'rawURL'
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid image URL')
            }

        # Construct the key condition expression
        if url_attribute == 'thumbnailURL':
            key_condition_expression = 'email = :email AND thumbnailURL = :image_url'
            
            # 修改1: 将print语句移出query函数调用
            print(f"Search thumbnailURL")
            
            response = dynamodb.query(
                TableName=table_name,
                KeyConditionExpression=key_condition_expression,
                ExpressionAttributeValues={
                    ':email': {'S': email},
                    ':image_url': {'S': image_url}
                }
            )
            
            if response['Count'] == 0:
                print(f"No match found for thumbnailURL")
                return {
                    'statusCode': 403,
                    'body': json.dumps('Access denied')
                }

            # Determine the bucket name based on the image URL
            bucket_name = 'picdetectionthumbnail'
            object_key = image_url.split(f'https://{bucket_name}.s3.us-east-1.amazonaws.com/')[1]
            print(f"image_url: {object_key}")
        
        else:
            # For rawURL, we'll use a scan since it is not a sort key
            print(f"Searching RawURL")
            response = dynamodb.scan(
                TableName=table_name,
                FilterExpression='email = :email AND rawURL = :image_url',
                ExpressionAttributeValues={
                    ':email': {'S': email},
                    ':image_url': {'S': image_url}
                }
            )
            
            if response['Count'] == 0:
                print(f"No match found for rawURL")
                return {
                    'statusCode': 403,
                    'body': json.dumps('Access denied')
                }
            
            # Determine the bucket name based on the image URL
            bucket_name = 'picdetectionbucket'
            object_key = image_url.split(f'https://{bucket_name}.s3.us-east-1.amazonaws.com/')[1]
            print(f"image_url: {object_key}")

        # Get the image object from S3
        s3_response = s3.get_object(Bucket=bucket_name, Key=object_key)
        image_data = s3_response['Body'].read()
        
        # Get the content type from S3 response metadata
        content_type = s3_response['ContentType']

        # Encode image data in base64
        image_base64 = b64encode(image_data).decode('utf-8')

        # Return base64 encode data
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': content_type,
            },
            'body': image_base64,
            'isBase64Encoded': True
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Unexpected error: {str(e)}')
        }
