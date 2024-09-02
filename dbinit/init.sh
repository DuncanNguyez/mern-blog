#!/bin/bash
echo "start"

export $(grep -v '^#' ../server/.env)

MONGO_VOLUME="server_blog-mongodb"
ELS_VOLUME="server_blog-els"

if docker volume ls | grep -q $MONGO_VOLUME; then
    echo "$MONGO_VOLUME volume exists"
else
    echo "init mongodb"
    mongorestore --host localhost --port 27018 --username $MONGO_USERNAME --password $MONGO_PASSWORD --db blog-app --authenticationDatabase admin --archive=mongo.init --gzip
fi

if docker volume ls | grep -q $ELS_VOLUME; then
    echo "$ELS_VOLUME volume exists"
else
    echo "init elsdb"
    elasticdump --input elsinit.json --output http://localhost:9201
fi

echo "done"
