# User Link

A Joplin plugin for custom links.

## Usage

**Ensure your URL is encoded!**

### Jump to anything

``` markdown
use resource id:

[???](jump://notes/{noteId})            # jump to note by id
[???](jump://notebooks/{notebookId})    # jump to notebook by id
[???](jump://tags/{tagId})              # jump to tag by id

use query params:

[???](jump://?query={query})            # jump to note via search
[???](jump://notes/?query={query})      # jump to note via search (also)
[???](jump://notebooks/?query={query})  # jump to notebook via search
[???](jump://tags/?query={query})       # jump to tag via search

or use `jumpq://`:

[???](jumpq://notes/{query})            # jump to note via search
[???](jumpq://notebooks/{query})        # jump to notebook via search
[???](jumpq://tags/{query})             # jump to tag via search
```

For more query syntax, see [here](https://joplinapp.org/#searching).

### exec any command

``` markdown
[createANote](exec://newNote)
[createANote](exec://newNote?0=blabla) # create with template text `blabla`
```

- Arguments are pass as a array;
- If the query string like `0=a&2=c`, only use `0=a`;
- Arguments will parse as json if possible, or use raw string;

Find more commands [here](https://joplinapp.org/api/references/plugin_api/classes/joplincommands.html).

## Build

1. run `npm run update`.
1. run `npm run dist`.
