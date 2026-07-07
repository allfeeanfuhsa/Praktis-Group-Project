FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port your server listens on
EXPOSE 5000

# Use the development script from package.json
CMD ["npm", "run", "dev"]
