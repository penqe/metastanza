export default async function text(stanza, params) {
  stanza.render({
    template: 'stanza.html.hbs',
    parameters: {
      greeting: `Hello, ${params['say-to']}!`
    }
  });
}
