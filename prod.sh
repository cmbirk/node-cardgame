#!/bin/sh

SOURCE_DIR=/home/tornado/development/node-websocket/
TMP_DIR=/tmp/build-node-websocket
TARGET_DIR=/var/www/vhosts/troefcallonline.nl/httpdocs
APP_DIR=/opt/apps/troefcall-node

RSYNC_OPTIONS='-rv --delete'
RSYNC_EXCLUDE='--exclude=.git --exclude=server/node_modules* --exclude=*.pyc --exclude=nohup.out --exclude=*.log'

./compressjs.sh behaviour/text.js behaviour/constants.js behaviour/tasks.js behaviour/animation.js behaviour/view.js behaviour/engine.js behaviour/messagehandler.js behaviour/application.js
rm -rf $TMPDIR
mkdir -p $TMPDIR
rsync $RSYNC_OPTIONS $RSYNC_EXCLUDE $SOURCE_DIR $TMP_DIR
find $TMP_DIR \( -name "*.js" -or -name "*.html" \) | xargs grep -l '9080' | xargs sed -i -e 's/9080/8080/g'
sed -n '1h;1!H;${g;s/<!-- START.*END APP-JS -->/<script type="text\/javascript" src="dist\/all.js"><\/script> /;p;}' $TMP_DIR/index.html > $TMP_DIR/index_tmp.html
cp $TMP_DIR/index_tmp.html $TMP_DIR/index.html
sudo rsync $RSYNC_OPTIONS $RSYNC_EXCLUDE $TMP_DIR/ $TARGET_DIR
sudo rsync $RSYNC_OPTIONS $RSYNC_EXCLUDE $TMP_DIR/ $APP_DIR
#sudo cp -R $TMP_DIR/* $APP_DIR
