FROM node:14-alpine

WORKDIR /app

COPY build /app/build
COPY *.json /app/
# COPY .env.production /app/.env

RUN npm ci --production 

ENV NODE_ENV production
ENV PORT 3002
EXPOSE ${PORT}

CMD [ "npm", "run", "start:all" ]
