import json
import boto3
from boto3.dynamodb.conditions import Key

dynamo = boto3.resource('dynamodb')

def lambda_handler(event, context):
    partition_key = event['email']
    cluster_key = event.get("thumbnail_url")
    print(cluster_key)
    # TODO implement
    table = dynamo.Table("picdetection")
    try:
    # 查询 DynamoDB 表
        if cluster_key is not None and partition_key is not None:
            response = table.query(
                KeyConditionExpression=Key('email').eq(partition_key) & Key('thumbnailURL').eq(cluster_key)
            )
            
            items = response.get('Items', [])
            print(items)
        response_headers = {
        'Access-Control-Allow-Origin': '*',  # 允许所有来源的请求
        'Access-Control-Allow-Headers': '*',  # 允许的请求头
        'Access-Control-Allow-Methods': 'OPTIONS,POST',  # 允许的请求方法
        }

        return {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps(items)
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': str(e),

        }

