import json
import boto3

dynamodb_client = boto3.client('dynamodb')
sns_client = boto3.client('sns')

SUBSCRIPTIONS_TABLE = 'subscription'
TOPIC_ARN = 'arn:aws:sns:us-east-1:029935479834:picDetectionService'

def set_filter_policy(subscription_arn, email):
    filter_policy = {
        'email': [email]
    }
    sns_client.set_subscription_attributes(
        SubscriptionArn=subscription_arn,
        AttributeName='FilterPolicy',
        AttributeValue=json.dumps(filter_policy)
    )

def lambda_handler(event, context):
    email = event['request']['userAttributes']['email']
    response = sns_client.subscribe(
        TopicArn=TOPIC_ARN,
        Protocol='email',
        Endpoint=email,
        ReturnSubscriptionArn=True
    )
    subscription_arn = response['SubscriptionArn']
    
    # Set the filter policy for this subscription
    set_filter_policy(subscription_arn, email)
    
    dynamodb_client.put_item(
        TableName=SUBSCRIPTIONS_TABLE,
        Item={
            'email': {'S': email},
            'subscriptionArn': {'S': subscription_arn},
            'tags': {'SS': [""]}
        }
    )
    return event
