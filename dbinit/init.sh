#!/bin/bash
echo "start"

export $(grep -v '^#' ../server/.env)

loglineMongosh=$(
    mongosh --port 27018 --username $MONGO_USERNAME --password $MONGO_PASSWORD --authenticationDatabase admin <<EOF
use('blog-app');
db.posts.find().count();
EOF
)
mongoPostCount=$(echo "$loglineMongosh" | tail -n 2 | grep -Eo '[0-9]+')

echo "mongoPost: $mongoPostCount"

if [ "$mongoPostCount" -gt 0 ]; then
    echo "has been db"
else
    echo "init mongodb"
    mongorestore --host localhost --port 27018 --username $MONGO_USERNAME --password $MONGO_PASSWORD --db blog-app --authenticationDatabase admin --archive=mongo.init --gzip
fi

loglineEls=$(curl -s -X GET "http://localhost:9201/post/_count" -H 'Content-Type: application/json')
elsPostCount=$(echo "$loglineEls" | grep -Eo '"count":[0-9]+' | grep -Eo '[0-9]+')

echo "elsPost: $elsPostCount"

if [ "$elsPostCount" -gt 0 ]; then
    echo "has been els db"
else
    echo "init elsdb"
    elasticdump --input elsinit.json --output http://localhost:9201
fi

echo "done"
