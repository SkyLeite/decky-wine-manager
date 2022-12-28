set dotenv-load

name  := `basename $PWD`

default: build createfolders deploy reload

build:
    @echo "Building"
    npm run build

createfolders:
    @echo "Ensuring folders have been created in the Steam Deck"
    @ssh deck@$DECKIP -p $DECKPORT -i $DECKKEY "mkdir -p $DECKDIR/homebrew/pluginloader && mkdir -p $DECKDIR/homebrew/plugins"

deploy:
    @echo "Deploying"
    @rsync \
        -azp \
        --delete \
        --chmod=D0755,F0755 \
        --rsh="ssh -p $DECKPORT -i $DECKKEY" \
        --exclude='.git/' \
        --exclude='.github/' \
        --exclude='.vscode/' \
        --exclude='node_modules/' \
        --exclude='src/' \
        --exclude='*.log' \
        --exclude='.gitignore' \
        . \
        deck@$DECKIP:$DECKDIR/homebrew/plugins/{{name}}

reload:
    @echo "Telling Decky to reload our script"
    @node scripts/reload.js

test:
    python -c 'import main; main.test()'
