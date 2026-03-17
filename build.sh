#!/bin/bash -e

VERSION=$(sed -n "3p" gladiatortraining-courses.php | cut -d'"' -f 2)
NEXTVERSION=$(echo ${VERSION} | awk -F. -v OFS=. '{$NF += 1 ; print}')
echo "Increasing version to ${NEXTVERSION}"
sed -i '' "3s/.*/\$PLUGIN_VERSION = \"${NEXTVERSION}\";/" gladiatortraining-courses.php
sed -i '' "20s/.*/ * Version:           ${NEXTVERSION}/" gladiatortraining-courses.php


echo "Installing client dependencies"

cd frontend
yarn build

echo "Copying files"
cd ..

rm -rf dist
rm -rf gladiatortraining-courses.zip

mkdir dist

cp -R admin dist/admin
cp -R includes dist/includes
cp -R languages dist/languages
cp -R public dist/public
cp -R ./*.php dist/




echo "Compressing files"
cd dist
zip -r ../gladiatortraining-courses.zip * &> /dev/null
cd ..
rm -rf dist

echo "============"
echo "Done, new version ${NEXTVERSION}"
echo "============"
