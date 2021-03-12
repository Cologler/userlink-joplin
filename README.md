# User Link

A Joplin plugin for custom links.

## Usage

**Ensure your URL is encoded!**

### exec any command

``` markdown
[createANote](exec://newNote)
[createANote](exec://newNote?0=blabla) # create with template text `blabla`
```

- Arguments are pass as a array;
- If the query string like `0=a&2=c`, only use `0=a`;
- Arguments will parse as json if possible, or use raw string;

Find more commands [here](https://joplinapp.org/api/references/plugin_api/classes/joplincommands.html).

### Jump via query

``` markdown
[???](jump://?query=blabla)
[???](jump://?query=title:blabla) # search by title
```

For more query syntax, see [here](https://joplinapp.org/#searching). 

## Build

1. run `npm run update`.
1. run `npm run dist`.
