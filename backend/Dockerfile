FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js ./
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 8787
USER node
CMD ["node", "server.js"]
