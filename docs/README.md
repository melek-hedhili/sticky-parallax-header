# Website

This website uses [Docusaurus 3](https://docusaurus.io/) with React 19 and MDX 3.
Use Node 24.21.0 and Yarn Classic 1.22.22. Its dependencies are installed separately
from the library and example applications.

## Installation

```console
yarn install --frozen-lockfile --non-interactive
```

## Local Development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn typecheck
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

The build compiles current documentation (`docs/`, served under `/docs/next/`),
the frozen `1.0.x` docs (`/docs/`), and the `0.4.x` archive. Keep those URLs and
historical APIs intact. Modernization guidance belongs in current docs; edits to
archived pages should only repair rendering or broken local links.

## Deployment

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
