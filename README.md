# GREBack
This is to provide backend service on GRE benchmarketing. The code can be divided into two parts: the code in /src/server/ is to receive indexes files from user can store in a MongoDB, and the /src/autoRun/ is to test the indexes in database one by one.

Before run the server.js, please replace the "54.206.175.145" in all files with your server (localhost for testing), then install modules with

npm install -y

then run server.js by 

node server.js
