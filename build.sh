#!/bin/bash -e

VERSION=$(sed -n "3p" gladiatortraining-registrations.php | cut -d'"' -f 2)
NEXTVERSION=$(echo ${VERSION} | awk -F. -v OFS=. '{$NF += 1 ; print}')
echo "Increasing version to ${NEXTVERSION}"
sed -i "3s/.*/\$PLUGIN_VERSION = \"${NEXTVERSION}\";/" gladiatortraining-registrations.php
sed -i "4s/.*/\$MAIL_API_KEY = \"${MAIL_API_KEY}\";/" gladiatortraining-registrations.php
sed -i "21s/.*/ * Version:           ${NEXTVERSION}/" gladiatortraining-registrations.php


echo "Installing client dependencies"

cd frontend
yarn install &>/dev/null

echo "Bundling client"
yarn bundleProd 1> /dev/null

echo "Copying files"
cd ..

rm -rf dist
# rm -rf gladiatortraining.zip
rm -rf gladiatortraining-registrations.zip

mkdir dist

cp -R admin dist/admin
cp -R includes dist/includes
cp -R languages dist/languages
cp -R public dist/public
cp -R ./*.php dist/

mkdir -p dist/frontend/build
cp -R frontend/build/* dist/frontend/build


find dist/frontend -name "*.map" | xargs rm -r

echo "Compressing files"
cd dist
zip -r ../gladiatortraining-registrations.zip * &> /dev/null
cd ..
rm -rf dist

# revert changes to avoid commiting them to repo
sed -i "4s/.*/\$MAIL_API_KEY = \"PLACEHOLDER\";/" gladiatortraining-registrations.php

echo "============"
echo "Done, new version ${NEXTVERSION}"
echo "============"
