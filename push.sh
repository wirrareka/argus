#!/bin/sh
set -e

HOST=ufon@titan.quanto.sk
PORT=65522

rm -rf argus argus.tgz;
npm run build;
mv dist argus;
COPYFILE_DISABLE=1 tar --no-mac-metadata -czf argus.tgz argus;
scp -P $PORT argus.tgz $HOST:

# Do /opt nemá ufon právo zapisovať, preto sa mení len obsah /opt/argus.
# Predchádzajúca verzia ostane v ~/argus.prev
ssh -p $PORT $HOST 'set -e
  test -w /opt/argus
  # Ak niektorý podpriečinok nie je zapisovateľný, skonči skôr, ako sa niečo zmaže
  test -z "$(find /opt/argus -type d ! -writable)"
  rm -rf /tmp/argus-deploy ~/argus.prev && mkdir /tmp/argus-deploy
  tar xzf ~/argus.tgz -C /tmp/argus-deploy 2>/dev/null
  cp -a /opt/argus ~/argus.prev
  find /opt/argus -mindepth 1 -delete
  cp -a /tmp/argus-deploy/argus/. /opt/argus/
  rm -rf /tmp/argus-deploy
  echo "Deploy OK: $(ls /opt/argus)"'

rm -rf argus argus.tgz;
