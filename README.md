# TrackingSystem

TrackingSystemは鳥取大学工学部にて研究・開発が行われている障がい者支援施設向け見守りシステムです。

## Running

手元にDocker環境を用意したほうが実行は簡単です。`docker-compose.yml`が用意してあるので、ルートディレクトリで以下を実行すればOKです。

```docker
docker-compose up
```

ローカルで実行する場合は先に[mongoDB](https://www.mongodb.com/)をインストールしておいてください。
その後ルートディレクトリに以下のように.envファイルを作成してください。

```dotenv
# 実行するポート設定
PORT = 3000  #設定しなければデフォルトで3000番ポートで実行されます

# mongoDB設定
DB_NAME = tracking #利用するmongoDB名
DB_URL = mongodb://localhost:27017/ #利用するmongoDBのアドレス

# メール通知用設定
MAIL_HOST = smtp.gmail.com #利用するホスト
MAIL_USER = hogehoge@gmail.com #送信に利用するメールアドレス
MAIL_PASS = piyopiyo #送信に利用するアカウントのPW

# MongoExpress(DBViewer)の設定
MONGO_EXPRESS_AVAILABLE = 1 #Viewerを有効化するかどうか
ME_CONFIG_MONGODB_AUTH_DATABASE = tracking #Viewerが参照するDB名(システム本体の利用するDBと同一)
ME_CONFIG_BASICAUTH_USERNAME = tracking #Viewerにアクセスする際のユーザー名
ME_CONFIG_BASICAUTH_PASSWORD = fugafuga #Viewerにアクセスする際のPW
```

上記の設定ファイルは一例です。適宜書き換えて利用してください。
そして以下のコマンドで依存ライブラリのインストールと実行を行ってください。

```npm
npm install
node index.js
```

TrackingSystemのルートにvarフォルダを作成し、その配下に
detector
location
updatelocation
log
をあらかじめフォルダ作成しておいてください。

実行した後に http://127.0.0.1:3000 へアクセスすればUIが表示されます。
