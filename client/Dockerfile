# Stage 1 - Builder Phase -> Output will be build folder
FROM node:16-alpine as builder
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Run Server Phase -> Use the output from Stage 1
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

# No need to specify the CMD as the default CMD of nginx image is to start the nginx server

# Build the image using the command: docker build -t <docker-id>/<image-name>:<version> .
#   => docker build -t mananparuthi/multi-client:v1 .
# Push the image to docker hub using the command: docker push <docker-id>/<image-name>:<version>
#   => docker push mananparuthi/multi-client:v1