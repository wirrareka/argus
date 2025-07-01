#!/bin/sh

rm -rf argus argus.tgz;
yarn build;
mv dist argus;
tar czvf argus.tgz argus;
scp argus.tgz titan:

