FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite default port
EXPOSE 5173

# Run vite with --host to expose it outside the container
CMD ["npm", "run", "dev", "--", "--host"]
