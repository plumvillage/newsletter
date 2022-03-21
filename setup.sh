#!/bin/sh

npm install

DIR="builds"
if [ ! -d "$DIR" ]; then
  mkdir "$DIR"
fi

# wget LTLM2022_FullMediaArchiveForBookGeneration_2022-03-20.tar.gz
# tar -xf LTLM2022_FullMediaArchiveForBookGeneration_2022-03-20.tar.gz -C src

# Install Netlify CLI for deployment
if [[ $(which netlify) ]]; then
  echo "netlify already installed"
else
  npm install -g netlify-cli
fi

# DEPRECATED. We now use Chrome Puppeteer
# Install Paged.js CLI for generating PDF files
# if [[ $(which pagedjs-cli) ]]; then
#   echo "pagedjs-cli already installed"
# else
#   npm install -g pagedjs-cli pagedjs
# fi
