#!/bin/bash
#
# Deploy script for https://georgepearse.github.io (user site)
# This script builds the project and syncs the dist folder to the user site repo
# Usage: ./scripts/deploy-user-site.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building project...${NC}"
npm run build

# Path to the user site repo (assume it's cloned next to this repo)
USER_SITE_REPO="../georgepearse.github.io"

if [ ! -d "$USER_SITE_REPO" ]; then
  echo -e "${BLUE}Cloning user site repo...${NC}"
  cd ..
  git clone https://github.com/GeorgePearse/GeorgePearse.github.io.git
  cd GeorgePearse
fi

echo -e "${BLUE}Syncing dist folder to user site repo...${NC}"

# Copy dist contents to user site root, excluding node_modules and .git
rsync -av --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.github' \
  dist/ "$USER_SITE_REPO/"

cd "$USER_SITE_REPO"

echo -e "${BLUE}Committing changes to user site...${NC}"
git add -A

if ! git diff --quiet --cached; then
  git config user.name "George Pearse"
  git config user.email "george@example.com"
  git commit -m "chore: sync built site from GeorgePearse repo"
  git push
  echo -e "${GREEN}User site deployed successfully!${NC}"
  echo "Live at: https://georgepearse.github.io"
else
  echo -e "${GREEN}No changes to deploy${NC}"
fi
