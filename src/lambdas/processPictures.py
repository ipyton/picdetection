import json
import boto3
import uuid
import base64
import requests
import cv2
import numpy as np
from urllib.parse import unquote_plus

# Configure S3 client
s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
dynamo = boto3.client('dynamodb')
table_name = 'picdetection'

lambda_function_name = "picdetection"
pic_bucket_name = "picdetectionbucket"
thumbnail_bucket_name = "picdetectionthumbnail"
notify_function_name = "notify"  # notify函数名

def make_thumbnail(data, thumbnail_size=(100, 100)):
    nparr = np.frombuffer(data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = image.shape[:2]
    scaling_factor = min(thumbnail_size[0] / w, thumbnail_size[1] / h)

    new_width = int(w * scaling_factor)
    new_height = int(h * scaling_factor)
    thumbnail = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return thumbnail

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        print("File {0} uploaded to {1} bucket".format(key, bucket))
        response = s3.get_object(Bucket=bucket, Key=key)
        metadata = response['Metadata']
        print(metadata)
        email = metadata.get("email", "example")
        print(email)
        image = response['Body'].read()
        response = lambda_client.invoke(
            FunctionName=lambda_function_name, 
            InvocationType='RequestResponse', 
            Payload=json.dumps({"body": base64.b64encode(image).decode("utf-8")})
        )
        tmps = json.loads(response['Payload'].read())
        print(image)
        
        thumbnail = make_thumbnail(image)
        _, buffer = cv2.imencode('.jpeg', thumbnail)
        file_name = key
        print(file_name)
    
        thumbnail_presigned = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': thumbnail_bucket_name, 'Key': file_name, 'ContentType': 'image/jpeg'},
            ExpiresIn=3600,
            HttpMethod='PUT'
        )
        response = requests.put(thumbnail_presigned, data=buffer.tobytes(), headers={"Content-Type": "image/jpeg"})
        region = s3.meta.region_name
        
        origin_url = f"https://{pic_bucket_name}.s3.{region}.amazonaws.com/{file_name}"
        thumbnail_url = f"https://{thumbnail_bucket_name}.s3.{region}.amazonaws.com/{file_name}"
        
        print(response)
        data = {}
        data['email'] = {"S": email}
        data["thumbnailURL"] = {"S": thumbnail_url}
        data["rawURL"] = {"S": origin_url}
        
        data['tags'] = json.loads(tmps['body'])['tags']
        response = dynamo.put_item(TableName=table_name, Item=data)
        
        # 调用notify Lambda函数
        notify_payload = {
            'email': email,
            'tags': data['tags']
        }
        lambda_client.invoke(
            FunctionName=notify_function_name,
            InvocationType='Event',  # 异步调用
            Payload=json.dumps(notify_payload)
        )

    return {
        'statusCode': 200,
        'body': json.dumps('Process completed and notify function invoked')
    }
import json
import boto3
import uuid
import base64
import requests
import cv2
import numpy as np
from urllib.parse import unquote_plus

# Configure S3 client
s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
dynamo = boto3.client('dynamodb')
table_name = 'picdetection'

lambda_function_name = "picdetection"
pic_bucket_name = "picdetectionbucket"
thumbnail_bucket_name = "picdetectionthumbnail"
notify_function_name = "notify"  # notify函数名

def make_thumbnail(data, thumbnail_size=(100, 100)):
    nparr = np.frombuffer(data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = image.shape[:2]
    scaling_factor = min(thumbnail_size[0] / w, thumbnail_size[1] / h)

    new_width = int(w * scaling_factor)
    new_height = int(h * scaling_factor)
    thumbnail = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return thumbnail

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        print("File {0} uploaded to {1} bucket".format(key, bucket))
        response = s3.get_object(Bucket=bucket, Key=key)
        metadata = response['Metadata']
        print(metadata)
        email = metadata.get("email", "example")
        print(email)
        image = response['Body'].read()
        response = lambda_client.invoke(
            FunctionName=lambda_function_name, 
            InvocationType='RequestResponse', 
            Payload=json.dumps({"body": base64.b64encode(image).decode("utf-8")})
        )
        tmps = json.loads(response['Payload'].read())
        print(image)
        
        thumbnail = make_thumbnail(image)
        _, buffer = cv2.imencode('.jpeg', thumbnail)
        file_name = key
        print(file_name)
    
        thumbnail_presigned = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': thumbnail_bucket_name, 'Key': file_name, 'ContentType': 'image/jpeg'},
            ExpiresIn=3600,
            HttpMethod='PUT'
        )
        response = requests.put(thumbnail_presigned, data=buffer.tobytes(), headers={"Content-Type": "image/jpeg"})
        region = s3.meta.region_name
        
        origin_url = f"https://{pic_bucket_name}.s3.{region}.amazonaws.com/{file_name}"
        thumbnail_url = f"https://{thumbnail_bucket_name}.s3.{region}.amazonaws.com/{file_name}"
        
        print(response)
        data = {}
        data['email'] = {"S": email}
        data["thumbnailURL"] = {"S": thumbnail_url}
        data["rawURL"] = {"S": origin_url}
        
        data['tags'] = json.loads(tmps['body'])['tags']
        response = dynamo.put_item(TableName=table_name, Item=data)
        
        # 调用notify Lambda函数
        notify_payload = {
            'email': email,
            'tags': data['tags']
        }
        lambda_client.invoke(
            FunctionName=notify_function_name,
            InvocationType='Event',  # 异步调用
            Payload=json.dumps(notify_payload)
        )

    return {
        'statusCode': 200,
        'body': json.dumps('Process completed and notify function invoked')
    }
