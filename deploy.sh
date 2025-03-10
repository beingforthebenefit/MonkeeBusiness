#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check out the gh-pages branch
git checkout gh-pages

# Merge the master branch into gh-pages
git merge master

# Push the changes to the remote repository
git push origin gh-pages

# Check out the master branch again
git checkout master

echo "Deployment to gh-pages completed successfully."