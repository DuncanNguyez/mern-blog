#!/bin/bash
echo "start"

ls 
cat ../server/.env
export $(grep -vE '^\s*#|^\s*$' ../server/.env | xargs)

mongoPostCount=$(
    docker exec blog-mongo mongosh --port 27017 --username $MONGO_USERNAME --password $MONGO_PASSWORD --authenticationDatabase admin --eval "use('blog-app');db.posts.find().count();"
)

echo "mongoPost: $mongoPostCount"

if [ "$mongoPostCount" -gt 0 ]; then
    echo "has been db"
else
    echo "init mongodb"
    docker cp mongo.init blog-mongo:mongo.init
    docker exec  blog-mongo mongorestore --host localhost --port 27017 --username $MONGO_USERNAME --password $MONGO_PASSWORD --db blog-app --authenticationDatabase admin --archive=mongo.init --gzip
fi

loglineEls=$(curl -s -X GET "http://localhost:9201/post/_count" -H 'Content-Type: application/json')
elsPostCount=$(echo "$loglineEls" | grep -Eo '"count":[0-9]+' | grep -Eo '[0-9]+')

echo "elsPost: $elsPostCount"

if [ "$elsPostCount" -gt 0 ]; then
    echo "has been els db"
else
    echo "init elsdb"
    npx elasticdump --input elsinit.json --output http://localhost:9201
fi

echo "done"
