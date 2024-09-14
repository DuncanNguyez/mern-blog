#!/bin/bash
echo "start"
# host.docker.internal
host=$1
if [ -z "$1" ]; then
    host="localhost"
fi

# export $(grep -vE '^\s*#|^\s*$' ../server/.env | xargs -d '\n')
. ../server/.env
eval="use('admin');db.auth('${MONGO_USERNAME//[$'\n']/}','${MONGO_PASSWORD//[$'\n']/}');use('blog-app');db.posts.find().count();"
echo $eval

mongoPostCount=$(
    docker exec blog-mongo mongosh --eval $eval
)

echo "mongoPost: $mongoPostCount"
mongoinit="docker exec blog-mongo mongorestore --host localhost --port 27017 --username $MONGO_USERNAME --password $MONGO_PASSWORD --db blog-app --authenticationDatabase admin --archive=mongo.init --gzip"
echo $mongoinit
if [ "$mongoPostCount" -eq 0 ]; then
    echo "init mongodb"
    docker cp mongo.init blog-mongo:mongo.init
    exec $mongoinit
else
    echo "has been db"
fi

loglineEls=$(curl -s -X GET "http://$host:9201/post/_count" -H 'Content-Type: application/json')
elsPostCount=$(echo "$loglineEls" | grep -Eo '"count":[0-9]+' | grep -Eo '[0-9]+')

echo "elsPost: $elsPostCount"

if [ "$elsPostCount" -eq 0 ]; then
    echo "init elsdb"
    npx elasticdump --input elsinit.json --output http://$host:9201
else
    echo "has been els db"
fi

echo "done"
