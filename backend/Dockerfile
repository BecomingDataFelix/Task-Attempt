FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]