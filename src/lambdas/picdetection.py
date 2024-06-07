import boto3
import json
from urllib.parse import unquote_plus
import json
import base64
import cv2
import numpy as np
from object_detection import do_prediction, load_model_from_s3

dynamo = boto3.client('dynamodb')
s3_client = boto3.client('s3')
table_name = 'picdetection'
nets, Lables = load_model_from_s3()
lambda_client = boto3.client('lambda')


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
        },
    }



def lambda_handler(event, context):
    '''Demonstrates a simple HTTP endpoint using API Gateway. You have full
    access to the request and response payload, including headers and
    status code.

    To scan a DynamoDB table, make a GET request with the TableName as a
    query string parameter. To put, update, or delete an item, make a POST,
    PUT, or DELETE request respectively, passing in the payload to the
    DynamoDB API as a JSON body.
    '''
    # with open(file_path, 'r') as file:
    #     content = file.read()
    
    print(event)
    image = base64.b64decode(event["body"])

    # bucket = record['s3']['bucket']['name']
    # key = unquote_plus(record['s3']['object']['key'])
    # print("File {0} uploaded to {1} bucket".format(key, bucket))
    # response = s3_client.get_object(Bucket=bucket, Key=key)
    # image = response['Body'].read()
    image = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    tmps = do_prediction(image, nets, Lables)
    # tmps = list(set([tem['label'] for tem in tmps if tem['accuracy'] > 0.3]))
    tmps = [tem['label'] for tem in tmps if tem['accuracy'] > 0.3]

    print(tmps)
    data = {}
    result = []
    # response = lambda_client.invoke(FunctionName=lambda_function_name, 
    # InvocationType='RequestResponse', 
    # Payload=json.dumps({"tags":tmps}))
    for tmp in tmps:
        result.append({"S":tmp})
    data["tags"] = {'L':result}
    print(data)
    
    return {
        'statusCode': 200,
        'body': json.dumps(data)
   }

