FROM node:12.18-alpine as libs

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../
RUN npm install jimp
RUN npm install express
RUN npm install body-parser
RUN pip install handwritten
RUN pip install minio

FROM openwhisk/dockerskeleton

COPY --from=libs . .

# Add all source assets
ADD . /action
# Rename our executable Python action
ADD handwritting.js /action/exec

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /action

USER appuser

EXPOSE 3000

CMD ["node", "handwritting.js"]
