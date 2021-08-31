#!/bin/bash

while inotifywait \
-e close_write index.js \
-e close_write views/pages/index.ejs
do
  rsync -av ./ palermo:apps/uploader/
  ssh palermo 'systemctl --user stop uploader.service'
  ssh palermo 'systemctl --user start uploader.service'
done
