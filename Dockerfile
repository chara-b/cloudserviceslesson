# install ubuntu and wget too !
#FROM ubuntu:14.04
#WORKDIR /wgettool
#RUN  apt-get update \
  #&& apt-get install -y wget \
  #&& rm -rf /var/lib/apt/lists/*

# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8-slim-buster as libs
#WORKDIR /libraries
RUN pip install tensorflow
RUN pip install numpy
RUN pip install zipfile36

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
# Dockerfile for Python whisk docker action
FROM openwhisk/dockerskeleton

# download dataset to train our cats and dogs detection model .. this is passed as parameter after build at running
  #docker build -t dockerfile .
  #docker run dockerfile !wget --no-check-certificate \
  #  https://storage.googleapis.com/mledu-datasets/cats_and_dogs_filtered.zip \
  #  -O /tmp/cats_and_dogs_filtered.zip
COPY --from=libs .    .
#COPY --from=wgettool /wgettool    .
# Install pip requirements
#COPY requirements.txt .
#RUN python -m pip install -r requirements.txt

#WORKDIR /app
#COPY . /app
# Install our action's Python dependencies
#ADD requirements.txt /action/requirements.txt
#RUN cd /action; pip install -r requirements.txt

# Ensure source assets are not drawn from the cache 
# after this date
#ENV REFRESHED_AT 2021-09-05T13:59:39Z
# Add all source assets
ADD . /action
# Rename our executable Python action
ADD detect.py /action/exec
# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /action
USER appuser
EXPOSE 3000
# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
#CMD ["python", "detect.py"]


# Leave CMD as is for Openwhisk
CMD ["/bin/bash", "-c", "cd actionProxy && python -u actionproxy.py"]