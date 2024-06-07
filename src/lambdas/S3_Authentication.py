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
        if event['httpMethod'] == 'POST':
            body = json.loads(event['body'])
            email = body.get('email')
            image_url = body.get('image_url')
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid request method. Only POST is supported.')
            }

        # Log the received parameters
        print(f"Received email: {email}")
        print(f"Received image_url: {image_url}")

        # Determine the attribute name based on the image URL
        if 'picdetectionthumbnail' in image_url:
            # For thumbnail URLs, use the thumbnailURL attribute
            url_attribute = 'thumbnailURL'
        elif 'picdetectionbucket' in image_url:
            # For raw URLs, we need to query based on email and rawURL
            url_attribute = 'rawURL'
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid image URL')
            }

        # Construct the query for DynamoDB
        if url_attribute == 'thumbnailURL':
            key_condition_expression = 'email = :email AND thumbnailURL = :image_url'
            print("Searching thumbnailURL")

            response = dynamodb.query(
                TableName=table_name,
                KeyConditionExpression=key_condition_expression,
                ExpressionAttributeValues={
                    ':email': {'S': email},
                    ':image_url': {'S': image_url}
                }
            )
        else:
            print("Searching RawURL")
            response = dynamodb.scan(
                TableName=table_name,
                FilterExpression='email = :email AND rawURL = :image_url',
                ExpressionAttributeValues={
                    ':email': {'S': email},
                    ':image_url': {'S': image_url}
                }
            )

        if response['Count'] == 0:
            print(f"No match found for {url_attribute}")
            return {
                'statusCode': 403,
                'body': json.dumps('Access denied')
            }

        # Determine the bucket name and object key
        if url_attribute == 'thumbnailURL':
            bucket_name = 'picdetectionthumbnail'
        else:
            bucket_name = 'picdetectionbucket'

        # Extract object key from URL
        object_key = image_url.split(f'https://{bucket_name}.s3.us-east-1.amazonaws.com/')[1]
        print(f"Object key: {object_key}")

        # Get the image object from S3
        print("Attempting to get object from S3...")
        s3_response = s3.get_object(Bucket=bucket_name, Key=object_key)
        print("S3 object retrieval successful.")

        # Read image data from the response
        print("Reading image data from S3 response...")
        image_data = s3_response['Body'].read()
        print(f"Image data read successfully, length: {len(image_data)} bytes.")

        # Get the content type from S3 response metadata
        content_type = s3_response.get('ContentType', 'application/octet-stream')
        print(f"Content type: {content_type}")

        # Encode image data in base64
        print("Encoding image data in base64...")
        image_base64 = b64encode(image_data).decode('utf-8')
        print(f"Base64 encoding successful, length: {len(image_base64)} characters.")
        print("Success")

        # Return base64 encoded data
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': content_type,
                'Access-Control-Allow-Origin': '*'
            },
            'body': image_base64,
            'isBase64Encoded': True
        }

        # except ClientError as e:
        #     print(f"ClientError: {str(e)}")
        #     return {
        #         'statusCode': 500,
        #         'body': json.dumps(f'Error: {str(e)}')
        #     }
        # except Exception as e:
        #     print(f"Unexpected error: {str(e)}")
        #     return {
        #         'statusCode': 500,
        #         'body': json.dumps(f'Unexpected error: {str(e)}')
        # }

        # # Get the image object from S3
        # s3_response = s3.get_object(Bucket=bucket_name, Key=object_key)
        # image_data = s3_response['Body'].read()

        # # Get the content type from S3 response metadata
        # content_type = s3_response['ContentType']

        # # Encode image data in base64
        # image_base64 = b64encode(image_data).decode('utf-8')
        # print(f"Success")

        # # Return base64 encode data
        # return {
        #     'statusCode': 200,
        #     'headers': {
        #         'Content-Type': content_type,
        #     },
        #     'body': image_base64,
        #     'isBase64Encoded': True
        # }

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
