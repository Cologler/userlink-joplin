import joplin from 'api';
import { ContentScriptType } from 'api/types';

/**
 * return `//` prefix
 * @param path
 * @returns
 */
function removePathPrefix(path: string) {
	if (path.startsWith('/')) path = path.substr(1);
	if (path.startsWith('/')) path = path.substr(1);
	return path;
}

async function jump(url: URL) {
	/**
	 * examples:
	 *   - jump://?query={query}#{hash}
	 */

	const query = url.searchParams.get('query');
	let hash = url.hash;
	if (hash) {
		hash = hash.substr(1);
	}

	if (query) {
		console.debug(`query: ${query}`);
		const r = await joplin.data.get(['search'], {
			fields: ['id'],
			query
		})
		console.debug(`notes count: ${r.items.length}`);
		if (r.items.length > 0) {
			joplin.commands.execute('openNote', r.items[0].id, hash);
		}
	}

	else if (hash) {
		// do I need this? I already had outline.
		// joplin.commands.execute('scrollToHash', hash);
	}
}

async function exec(url: URL) {
	/**
	 * examples:
	 *   - exec://{command}?0=a&1=ds
	 */

	let command = removePathPrefix(url.pathname);

	const args = [];
	for (let i = 0; i < 20; i++) {
		const is = i.toString();
		if (url.searchParams.has(is)) {
			let val = url.searchParams.get(is);
			try {
				val = JSON.parse(val);
			} catch {}
			args.push(val);
		} else {
			break;
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
					jump(url);
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
