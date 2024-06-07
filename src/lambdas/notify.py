import boto3
import json

SUBSCRIPTIONS_TABLE = 'subscription'
TOPIC_ARN = 'arn:aws:sns:us-east-1:029935479834:picDetectionService'
dynamodb_client = boto3.client('dynamodb')
sns_client = boto3.client("sns")

def notify_user(email, tags):
    # Get user subscription
    response = dynamodb_client.get_item(
        TableName=SUBSCRIPTIONS_TABLE,
        Key={'email': {'S': email}}
    )
    
    subscription = response.get('Item', {})
    
    if not subscription:
        print(f"No subscription found for {email}")
        return
    
    subscribed_tags = set(subscription['tags']['SS'])
    print(f"Subscribed tags for {email}: {subscribed_tags}")
    
    # Extract tags from image
    # image_tags = set(tag['S'] for tag in tags['L'])
    # image_tags = [tag['S'] for tag in tags['L']] # tags is remained as a list
    
    if isinstance(tags, dict):
        image_tags = [tag['S'] for tag in tags['L']]
    else:
        image_tags = set(tags)

    
      
    print(f"Tags from image: {image_tags}")
    
    matching_tags = subscribed_tags.intersection(image_tags)
    print(f"Matching tags: {matching_tags}")
    
    if matching_tags:
        message = {
            'message': 'New image with interesting tags added',
            'tags': list(matching_tags),
        }
        sns_client.publish(
            TopicArn=TOPIC_ARN,
            Message=json.dumps({'default': json.dumps(message)}),
            MessageStructure='json',
            MessageAttributes={
                'email': {
                    'DataType': 'String',
                    'StringValue': email
                }
            }
        )
        print(f"Notification sent to {email}")

def lambda_handler(event, context):
    print(event)  
    
    if 'email' not in event or 'tags' not in event:
        print("Error: 'email' or 'tags' key not found in event")
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid event structure')
        }
    
    email = event['email']
    tags = event['tags']
    
    notify_user(email, tags)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Notification sent')
    }
