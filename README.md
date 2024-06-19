# BigchainDB Documentation

## js-driver documentation

### API End Point
- /
  - GET - fetch asset according to query
  - POST - create a transaction with a record
  - PUT - update asset with query and update data
  - DELETE - delete asset according to query
* /api/transactions
* /api/assets
* /api/metadata


### Install BigchainDB all-in-one using docker
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

## Elastic Search Install
    docker pull elasticsearch:8.14.1

    docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch -e "discovery.type=single-node" elasticsearch:8.14.1

    docker pull logstash:8.14.1

    docker run -d -p 5044:5044 -p 9600:9600 --name logstash logstash:8.14.1

    touch logstash.conf

- LogStash Config

      input {
        http_poller {
          urls => {
            bigchaindb => "http://localhost:9984/api/v1/transactions?asset_id=1"
          }
          request_timeout => 60
          schedule => { cron => "* * * * * UTC" }
          codec => "json"
        }
      }

      filter {
        split {
          field => "transactions"
        }
      }

      output {
        elasticsearch {
          hosts => ["http://localhost:9200"]
          index => "bigchaindb"
        }
      }

docker cp logstash.conf logstash:/usr/share/logstash/pipeline/logstash.conf
docker exec -it logstash logstash -f /usr/share/logstash/pipeline/logstash.conf

____________________________________________
## BigchainDB installation

### Clone Bigchaindb Github
    git clone https://github.com/bigchaindb/bigchaindb.git

### pyenv install

    sudo apt-get update

    sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev \
    python-openssl git

    curl https://pyenv.run | bash

    export PATH="$HOME/.pyenv/bin:$PATH"
    eval "$(pyenv init --path)"
    eval "$(pyenv init -)"
    eval "$(pyenv virtualenv-init -)"

    exec "$SHELL"

### Python 3.8 install
    pyenv install 3.8.10

    pyenv global 3.8.10

### Bigchaindb install
    cd ./bigchaindb

    python setup.py install

### Mongodb install
#### v5.0
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    
    sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

    sudo apt-get update

    sudo apt-get install -y mongodb-org

#### v4.4

#### Uninstall
    sudo apt-get remove --purge mongodb-org*

    sudo rm -r /var/log/mongodb

    sudo rm -r /var/lib/mongodb



### Bigchaindb Operation
    bigchaindb configure
