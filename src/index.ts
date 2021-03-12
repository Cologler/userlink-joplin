import joplin from 'api';
import { ContentScriptType } from 'api/types';

async function jump(url: URL) {
	const query = url.searchParams.get('query');
	if (query) {
		console.debug(`query: ${query}`);
		const r = await joplin.data.get(['search'], {
			fields: ['id', 'title'],
			query
		})
		console.debug(`notes count: ${r.items.length}`);
		if (r.items.length > 0) {
			joplin.commands.execute(
				'openNote',
				r.items[0].id
			);
		}
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
			}
		});

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			contentScriptId,
			'./contentScript.js'
		);
	},
});
