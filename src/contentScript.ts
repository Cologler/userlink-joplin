import { ContentScriptContext } from "api/types";

export default function(context: ContentScriptContext) {
    return {
        plugin: function(markdownIt: markdownit, _options: markdownit.Options) {
            const contentScriptId = context.contentScriptId;

            const defaultRender = markdownIt.renderer.rules['link_open'] || function(tokens, index, options, _, renderer) {
                return renderer.renderToken(tokens, index, options);
            };

            markdownIt.renderer.rules['link_open'] = function(tokens, index, options, env, renderer): string {
                const token = tokens[index];

                const href = token.attrGet('href');
                if (href) {
                    if (/^(?:jump|exec):/i.test(href)) {
                        const data = btoa(href);
                        const action = `
                            event.stopPropagation();
                            webviewApi.postMessage('${contentScriptId}', '${data}');
                            return false;
                        `;
                        token.attrSet('onclick', action.trim().replace(/\n/g, ' '));
                        return renderer.renderToken(tokens, index, options);
                    }
                }

                const rendered = defaultRender(tokens, index, options, env, renderer);
                return rendered;
            };
        }
    };
}
