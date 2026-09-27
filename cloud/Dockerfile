FROM node:22-alpine

WORKDIR /app
COPY server.cjs ./server.cjs
RUN mkdir -p /data && chown -R node:node /app /data

USER node
ENV WORKBRIDGE_CLOUD_HOST=0.0.0.0 \
    WORKBRIDGE_CLOUD_PORT=8787 \
    WORKBRIDGE_CLOUD_DATA=/data
VOLUME ["/data"]
EXPOSE 8787
CMD ["node", "server.cjs"]
