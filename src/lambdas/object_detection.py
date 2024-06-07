# import the necessary packages
import numpy as np
import sys
import time
import boto3
import os
import cv2
import base64
import threading

# Initialize S3 client
s3_client = boto3.client('s3')

# Used for ensuring that the model is not preempted
lock = threading.Lock()

# Define thresholds
confthres = 0.3
nmsthres = 0.1

def get_s3_file(bucket, key, download_path):
    s3_client.download_file(bucket, key, download_path)

def load_model_from_s3():
    bucket = os.environ['S3_BUCKET']
    get_s3_file(bucket, 'yolov3-tiny.cfg', '/tmp/yolov3-tiny.cfg')
    get_s3_file(bucket, 'yolov3-tiny.weights', '/tmp/yolov3-tiny.weights')
    get_s3_file(bucket, 'coco.names', '/tmp/coco.names')

    net = cv2.dnn.readNetFromDarknet('/tmp/yolov3-tiny.cfg', '/tmp/yolov3-tiny.weights')
    labels = open('/tmp/coco.names').read().strip().split("\n")
    
    return net, labels

# Load the YOLO model and labels
nets, Lables = load_model_from_s3()

def do_prediction(image, net, LABELS):
    with lock:
        (H, W) = image.shape[:2]
        # Determine only the *output* layer names that we need from YOLO
        ln = net.getLayerNames()
        ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]

        # Construct a blob from the input image and then perform a forward pass of the YOLO object detector
        blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        start = time.time()
        layerOutputs = net.forward(ln)
        end = time.time()

        # Initialize our lists of detected bounding boxes, confidences, and class IDs, respectively
        boxes = []
        confidences = []
        classIDs = []

        # Loop over each of the layer outputs
        for output in layerOutputs:
            for detection in output:
                scores = detection[5:]
                classID = np.argmax(scores)
                confidence = scores[classID]

                if confidence > confthres:
                    box = detection[0:4] * np.array([W, H, W, H])
                    (centerX, centerY, width, height) = box.astype("int")
                    x = int(centerX - (width / 2))
                    y = int(centerY - (height / 2))
                    boxes.append([x, y, int(width), int(height)])
                    confidences.append(float(confidence))
                    classIDs.append(classID)

        # Apply non-maxima suppression to suppress weak, overlapping bounding boxes
        idxs = cv2.dnn.NMSBoxes(boxes, confidences, confthres, nmsthres)

        result = []
        if len(idxs) > 0:
            for i in idxs.flatten():
                result.append({
                    "label": LABELS[classIDs[i]],
                    "accuracy": confidences[i],
                    "rectangle": {
                        "height": boxes[i][3],
                        "left": boxes[i][0],
                        "top": boxes[i][1],
                        "width": boxes[i][2]
                    }
                })
        return result

def detect_base64_image(image):
    # Decode Base64 strings
    img_transferred = cv2.imdecode(np.frombuffer(base64.b64decode(image), np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(img_transferred, cv2.COLOR_BGR2RGB)
    return do_prediction(image, nets, Lables)
