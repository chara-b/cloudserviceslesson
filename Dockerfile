FROM node:12.18-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../
RUN npm install jimp
RUN npm install express
RUN npm install body-parser
RUN pip install handwritten
RUN pip install minio

COPY . .

EXPOSE 3000

CMD ["node", "handwritting.js"]
