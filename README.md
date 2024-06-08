# BigchainDB Javascript Proxy Documentation

### API End Point
* /
GET - fetch asset according to query
POST - create a transaction with a record
PUT - update asset with query and update data
DELETE - delete asset according to query
* /api/transactions
* /api/assets
* /api/metadata


### Install Serverl Command

<code>
docker run \
  --detach \
  --name bigchaindb \
  --publish 9984:9984 \
  --publish 9985:9985 \
  --publish 27017:27017 \
  --publish 26657:26657 \
  --volume $HOME/bigchaindb_docker/mongodb/data/db:/data/db \
  --volume $HOME/bigchaindb_docker/mongodb/data/configdb:/data/configdb \
  --volume $HOME/bigchaindb_docker/tendermint:/tendermint \
  bigchaindb/bigchaindb:all-in-one
</code>