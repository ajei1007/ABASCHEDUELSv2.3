FROM node:22

ADD . /app
WORKDIR /app

RUN yarn install
EXPOSE 8080

CMD ["yarn", "dev"]
