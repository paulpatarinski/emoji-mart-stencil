<div align="center">
  <br><b>Emoji Mart</b> is a Slack-like customizable<br>emoji picker component
  <br><br><img width="338" alt="picker" src="https://user-images.githubusercontent.com/436043/32532554-08be471c-c400-11e7-906a-c745dc3ec630.png">
  <br><br><a title="Team email, team chat, team tasks, one app" href="https://missiveapp.com"><img width="30" alt="Missive | Team email, team chat, team tasks, one app" src="https://user-images.githubusercontent.com/436043/32532559-0d15ddfc-c400-11e7-8a24-64d0157d0cb0.png"></a>
  <br>Brought to you by the <a title="Team email, team chat, team tasks, one app" href="https://missiveapp.com">Missive</a> team
</div>

# What?
Port of the popular react [emoji-mart](https://github.com/missive/emoji-mart) component

# Why?
To use in non-react apps (Ionic, angular apps..others)  

# How?

Stencil is a compiler for building fast web apps using Web Components.

Stencil combines the best concepts of the most popular frontend frameworks into a compile-time rather than run-time tool.  Stencil takes TypeScript, JSX, a tiny virtual DOM layer, efficient one-way data binding, an asynchronous rendering pipeline (similar to React Fiber), and lazy-loading out of the box, and generates 100% standards-based Web Components that run in any browser supporting the Custom Elements v1 spec.

Stencil components are just Web Components, so they work in any major framework or with no framework at all.

## Contributing

```bash
npm install
npm start
```

To build the component for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```

Need help? Check out stencil docs [here](https://stenciljs.com/docs/my-first-component).


## Using this component

### Script tag

- [Publish to NPM](https://docs.npmjs.com/getting-started/publishing-npm-packages)
- Put a script tag similar to this `<script src='https://unpkg.com/my-component@0.0.1/dist/mycomponent.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### Node Modules
- Run `npm install my-component --save`
- Put a script tag similar to this `<script src='node_modules/my-component/dist/mycomponent.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### In a stencil-starter app
- Run `npm install my-component --save`
- Add `{ name: 'my-component' }` to your [collections](https://github.com/ionic-team/stencil-starter/blob/master/stencil.config.js#L5)
- Then you can use the element anywhere in your template, JSX, html etc

### Credits

Since this is just a port all credit goes to the writers of https://github.com/missive/emoji-mart & the Missive team. As well as the Ionic team for creating https://github.com/ionic-team/stencil. Thank you for doing all the hard work