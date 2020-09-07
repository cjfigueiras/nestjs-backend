FROM node:8.11
LABEL appname="CCI Digipilote"

ARG ENV
ARG PORT

# if --build-arg PROD=1, set BUILD_ENV to 'production' or set to null otherwise.
# ENV BUILD_ENV=${PROD:+production}
# # if BUILD_ENV is null, set it to 'staging' (or leave as is otherwise).
# ENV BUILD_ENV=${BUILD_ENV:-staging}

# # if --build-arg PROD=1, set PORT to '8080' or set to null otherwise.
# ENV PORT=${PROD:+8080}
# # if PORT is null, set it to '8000' (or leave as is otherwise).
# ENV PORT=${PORT:-8000}


ENV BUILD_ENV=$ENV

# Install Dependencies and Copy Source Files
RUN mkdir /node
WORKDIR /node
COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

# Set Up the App to Run
EXPOSE ${PORT}

CMD if [ "$BUILD_ENV" = "production" ]; then \
        npm run start:prod; \
    elif [ "$BUILD_ENV" = "preproduction" ]; then \
        npm run start:preprod; \
    else \
        npm run start:dev; \
    fi
