from tensorflow.keras.applications.vgg16 import VGG16
import os 
import zipfile 
import tensorflow as tf 
from tensorflow.keras.preprocessing.image import ImageDataGenerator 
from tensorflow.keras import layers 
from tensorflow.keras import Model 
import matplotlib.pyplot as plt
import numpy as np
# https://www.analyticsvidhya.com/blog/2020/08/top-4-pre-trained-models-for-image-classification-with-python-code/

import sys
import json


# install ubuntu and wget too !
FROM ubuntu:14.04
RUN  apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8-slim-buster

# Dockerfile for Python whisk docker action
FROM openwhisk/dockerskeleton

# download dataset to train our cats and dogs detection model .. this is passed as parameter after build at running
  #docker build -t dockerfile .
  #docker run dockerfile !wget --no-check-certificate \
  #  https://storage.googleapis.com/mledu-datasets/cats_and_dogs_filtered.zip \
  #  -O /tmp/cats_and_dogs_filtered.zip

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install pip requirements
#COPY requirements.txt .
#RUN python -m pip install -r requirements.txt

#WORKDIR /app
#COPY . /app
# Install our action's Python dependencies
ADD requirements.txt /action/requirements.txt
RUN cd /action; pip install -r requirements.txt

# Ensure source assets are not drawn from the cache 
# after this date
ENV REFRESHED_AT 2016-09-05T13:59:39Z
# Add all source assets
ADD . /action
# Rename our executable Python action
ADD detect.py /action/exec
# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser
EXPOSE 3000
# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
#CMD ["python", "detect.py"]
# Leave CMD as is for Openwhisk
CMD ["/bin/bash", "-c", "cd actionProxy && python -u actionproxy.py"]