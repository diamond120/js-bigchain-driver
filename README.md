# BigchainDB Javascript Proxy Documentation

### API End Point
* /bigchaindb
* /api/transactions
* /api/assets
* /api/metadata

### Query Format

<!-- - <code>where = is</code> -->

<!-- - <code>whereNot = not</code> -->

- <code>orWhere = or</code>

- <code>orWhereNot = orNot</code>

<!-- - <code>whereIn = in</code> -->

- <code>orWhereIn = orIn</code>

<!-- - <code>whereNotIn = notIn</code> -->

- <code>orWhereNotIn = orNotIn</code>

<!-- - <code>whereBetween = between</code> -->

- <code>orWhereBetween = orBetween</code>

- <code>whereNotBetween = notBetween</code>

- <code>orWhereBetween = orBetween</code>


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