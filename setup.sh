#!/bin/sh

npm install

DIR="builds"
if [ ! -d "$DIR" ]; then
  mkdir "$DIR"
fi

# tar -xf LTLM2023_and_2022_FullMediaArchiveForBookGeneration_2023-02.tar.gz -C src

# Install Netlify CLI for deployment
if [[ $(which netlify) ]]; then
  echo "netlify already installed"
else
  npm install -g netlify-cli
fi
