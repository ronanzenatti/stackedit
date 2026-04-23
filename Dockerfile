FROM node:24-alpine AS build

WORKDIR /opt/stackedit

COPY package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV production
RUN npm run build

FROM node:24-alpine AS production

WORKDIR /opt/stackedit

RUN apk add --no-cache pandoc wkhtmltopdf

COPY --from=build /opt/stackedit/package*.json ./
COPY --from=build /opt/stackedit/scripts ./scripts
RUN npm ci --omit=dev

COPY --from=build /opt/stackedit/dist ./dist
COPY --from=build /opt/stackedit/server ./server
COPY --from=build /opt/stackedit/config ./config
COPY --from=build /opt/stackedit/index.mjs ./

ENV NODE_ENV production
EXPOSE 8080

CMD [ "node", "index.mjs" ]
