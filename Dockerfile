FROM node:22-alpine

WORKDIR /app

RUN apk update && apk add --no-cache bash

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 3030

CMD ["npm", "start"]