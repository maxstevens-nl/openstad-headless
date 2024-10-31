ln -s /data/public /app/apps/cms-server/public
ln -s /data/data /app/apps/cms-server/data

node app @apostrophecms/migration:migrate

node app.js
