import json
import boto3
from boto3.dynamodb.types import TypeDeserializer

from urllib.parse import urlparse

dynamo = boto3.resource('dynamodb')
s3_client = boto3.client('s3')
table_name = 'picdetection'
deserializer = TypeDeserializer()
table = dynamo.Table(table_name)
lambda_client = boto3.client('lambda')


def delete(email, id):
    response = table.delete_item(
        Key={
            'email': email,
            'thumbnailURL': id
        })
    parsed_url = urlparse(id)
    bucket_name = parsed_url.netloc.split('.')[0]
    object_key = parsed_url.path.lstrip('/')
    print(bucket_name)
    print(object_key)
    s3_client.delete_object(Bucket="picdetectionbucket",Key=object_key)
    s3_client.delete_object(Bucket="picdetectionthumbnail",Key=object_key)
    return {
        'statusCode': 200,
        'body': json.dumps('Item deleted successfully!')
    }

def modify(email,id, tags):
    print(tags)
    update_expression = 'SET #attr = :val'
    expression_attribute_names = {
        '#attr': 'tags'
    }

    expression_attribute_values = {
        ':val': tags
    }
    
    response = table.update_item(
        Key={
            'email': email,
            'thumbnailURL': id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
        ReturnValues='UPDATED_NEW')
    response_headers = {
    'Access-Control-Allow-Origin': '*',  
    'Access-Control-Allow-Headers': '*',  
    'Access-Control-Allow-Methods': 'OPTIONS,POST', 
    }
    return {
        'statusCode': 200,            
        'headers': response_headers,
        'body': json.dumps('Item updated successfully!'),

    }
    

def lambda_handler(event, context):
    # TODO implement
    print(type(event["body"]))
    body = json.loads(event["body"])
    print(body)
    operation = body['operation']
    email = body['email']
    print(event)
    id = body["id"]
    if operation is None or id is None:
        return {
            'statusCode': 200,
            'body':"error header"
        }
    
    if operation == "modify":
        tags = body['tags']
        plus = body['plus']
        print(plus)
        # tags = list(set(tags))
        
        
        
        # tags = list(tags)
        
        # response = lambda_client.invoke(FunctionName="notify", InvocationType='RequestResponse',Payload=json.dumps({"tags":plus}))
        lambda_client.invoke(
            FunctionName="notify",
            InvocationType='RequestResponse',
            Payload=json.dumps({"email": email, "tags": plus})
        )
        
        print("----")
        # print(response)
        return modify(email,id, tags)
    elif operation == "delete":
        return delete(email, id)
    
    return {
        'statusCode': 200,
        'body': "Do not find any operation"
    }
