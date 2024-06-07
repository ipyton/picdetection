import json
import boto3
from boto3.dynamodb.types import TypeDeserializer

dynamo = boto3.client('dynamodb')
s3_client = boto3.client('s3')
table_name = 'picdetection'
deserializer = TypeDeserializer()

def convert_item(item):
    return {k: deserializer.deserialize(v) for k, v in item.items()}
    
def scan_table(email):
    results = []
    last_evaluated_key = None
    while True:
        if last_evaluated_key:
            response = dynamo.scan(
                TableName=table_name,
                FilterExpression='email = :email',
                ExpressionAttributeValues={':email': {'S': email}},
                ExclusiveStartKey=last_evaluated_key
            )
        else: 
            response = dynamo.scan(TableName=table_name,
                FilterExpression='email = :email',
                ExpressionAttributeValues={':email': {'S': email}})
        last_evaluated_key = response.get('LastEvaluatedKey')
        results.extend(response['Items'])
        if not last_evaluated_key:
            break
    converted_data = [convert_item(item) for item in results]
    return converted_data
    

def lambda_handler(event, context):
    # TODO implement
    relationship = event['relationship']
    tags = event['tags']
    email = event['email']
    print(type(tags))
    print(relationship)
    if relationship is None or tags is None or len(tags) == 0:
        return {
            'statusCode': 200,
            'body':[]
        }
    # no_duplicate = set()
    # for tag in tags.keys():
    #     if tag not in no_duplicate:
    #         no_duplicate.add(tags[tag])
    
    items = scan_table(email)
    print(items)
    result = []
    tag_count_request = {}
    for tag in tags:
        print(type(tag))
        tag_count_request[tag['tag']] = int(tag['repetitions'])
    if relationship == "and":
        for item in items:
            flag = False
            tags_in_table = item.get("tags", [])
            tag_count_table = {}
            if tags_in_table is None or len(tags_in_table) == 0:
                continue
            for tag in tags_in_table:
                if tag in tag_count_table:
                    tag_count_table[tag] += 1
                else:
                    tag_count_table[tag] = 1
                    
            for tag in tag_count_request.keys():
                if tag not in tag_count_table.keys()  or tag_count_table[tag] < tag_count_request[tag]:
                    flag = True
                    break
            if not flag:
                result.append(item.get("thumbnailURL"))
    elif relationship == "or":
        for item in items:
            tags_in_table = item.get("tags", [])
            tag_count_table = {}
            if tags_in_table is None or len(tags_in_table) == 0:
                continue
            for tag in tags_in_table:
                if tag in tag_count_table:
                    tag_count_table[tag] += 1
                else:
                    tag_count_table[tag] = 1
            for tag in tag_count_request.keys():
                if tag in tag_count_table.keys() and tag_count_request[tag] <= tag_count_table[tag]:
                    result.append(item.get("thumbnailURL"))
                    break
            
    return {
        'statusCode': 200,
        'body': result
    }