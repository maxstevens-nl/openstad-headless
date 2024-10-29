ln -s ${APOS_ROOT_DIR}/public $(pwd)/public
ln -s ${APOS_ROOT_DIR}/data $(pwd)/data

node app @apostrophecms/migration:migrate

node app.js
