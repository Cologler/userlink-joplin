import joplin from 'api';
import { ContentScriptType } from 'api/types';

/**
 * return `/` prefix
 * @param path
 * @returns
 */
function removePathPrefix(path: string, count: number = 2) {
    while (--count >= 0) {
        if (path.startsWith('/')) {
            path = path.substr(1);
        } else {
            break;
        }
    }

    return path;
}

async function jump(url: URL, pathAsQuery: boolean) {
    /**
     * examples:
     *   - jump://?query={query}#{hash}
     *   - jump://notebook/{notebookName}
     *   - jump://tag/{tagName}
     */

    const path = removePathPrefix(url.pathname, 2);

    let hash = url.hash;
    if (hash) {
        hash = hash.substr(1); // remove char `#`
    }

    function jumpNote(noteId: string) {
        return joplin.commands.execute('openNote', noteId, hash);
    }

    function jumpNoteBook(noteBookId: string) {
        return joplin.commands.execute('openFolder', noteBookId);
    }

    function jumpTag(tagId: string) {
        return joplin.commands.execute('openTag', tagId);
    }

    let type: 'folder' | 'tag' | 'note';
    let jumper: (id: string) => Promise<any>;
    let remainingPath: string = '';

    const lowerPath = path.toLowerCase();
    if (lowerPath === 'notebooks' || lowerPath.startsWith('notebooks/')) {
        type = 'folder';
        jumper = jumpNoteBook;
        remainingPath = removePathPrefix(path.substr(9), 1);
    }
    else if (lowerPath === 'tags' || lowerPath.startsWith('tags/')) {
        type = 'tag';
        jumper = jumpTag;
        remainingPath = removePathPrefix(path.substr(4), 1);
    }
    else if (lowerPath === 'notes' || lowerPath.startsWith('notes/')) {
        type = 'note';
        jumper = jumpNote;
        remainingPath = removePathPrefix(path.substr(5), 1);
    }
    else if (!lowerPath) {
        type = 'note';
        jumper = jumpNote;
    }
    else {
        console.debug(`ignore unknown path: ${path}`);
        return; // ignored
    }
    console.debug(`link type: ${type}`);

    let r;
    if (remainingPath && !pathAsQuery) {
        console.debug(`find by id: ${remainingPath}`);
        try {
            r = await joplin.data.get([type + 's', remainingPath]);
        } catch (error) {
            // not found
            return;
        }
    }
    else {
        const query = pathAsQuery
            ? remainingPath
            : url.searchParams.get('query');
        if (!query) {
            return;
        }
        console.debug(`find by query: ${query}`);
        r = await joplin.data.get(['search'], {
            fields: ['id'],
            query,
            type
        });
    }

    console.debug(`total count: ${r.items.length}`);

    if (r.items.length > 0) {
        await jumper(r.items[0].id);
    }
}

async function exec(url: URL) {
    /**
     * examples:
     *   - exec://{command}?0=a&1=ds
     */

    let command = removePathPrefix(url.pathname, 2);

    const args = [];
    for (const [key, value] of url.searchParams.entries()) {
        const index = Number.parseInt(key, 10);
        if (index !== NaN && index >= 0) {
            let val = value;
            try {
                val = JSON.parse(val);
            } catch {}
            args[index] = val;
        }
    }

    if (command) {
        console.debug(`exec ${command} with arguments: ${args}`);
        joplin.commands.execute(command, ...args);
    }
}

joplin.plugins.register({
    onStart: async function() {
        const contentScriptId = '3f805159-e407-4184-b1fb-764abe3c6a91';

        await joplin.contentScripts.onMessage(contentScriptId, (message: string) => {
            const href = atob(message);
            console.debug(`clicked: ${href}`);

            const url = new URL(href);
            switch (url.protocol.toLowerCase()) {
                case 'jump:':
                    jump(url, false);
                    break;

                case 'jumpq:':
                    jump(url, true);
                    break;

                case 'exec:':
                    exec(url);
                    break;
            }
        });

        await joplin.contentScripts.register(
            ContentScriptType.MarkdownItPlugin,
            contentScriptId,
            './contentScript.js'
        );
    },
});
