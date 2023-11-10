[![NPM](https://img.shields.io/badge/NPM-ba443f?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![NODE](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![React](https://img.shields.io/badge/-ReactJs-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://zh-hant.reactjs.org/)
[![TS](https://img.shields.io/badge/Typescript-4277c0?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LESS](https://img.shields.io/badge/Less-1d365d?style=for-the-badge&logo=less&logoColor=white)](https://lesscss.org/)
[![TW](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=npm&logoColor=white)](https://tailwindcss.com/)
[![ROUTER](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=npm&logoColor=white)](https://reactrouter.com/)
[![EXPRESS](https://img.shields.io/badge/express-%23404d59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TS](https://img.shields.io/badge/Typescript-4277c0?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NETLIFY](https://img.shields.io/badge/netlify-%23000000?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

<p align="center">
  <a href="https://github.com/jameshsu1125">
    <img src="https://user-images.githubusercontent.com/70932507/188534539-a68734ac-9330-4fe0-bc49-5fa85116493e.png" alt="Logo" width=72 height=72>
  </a>
  <h3 align="center">Logo</h3>
  <p align="center">
    Short description   
  </p>
</p>

## Table of contents

- [Table of contents](#table-of-contents)
- [Quick start](#quick-start)
- [Status](#status)
- [What's included](#whats-included)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [naming conventions rules](#naming-conventions-rules)
- [Contributing](#contributing)
- [Creators](#creators)
- [Thanks](#thanks)
- [Copyright and license](#copyright-and-license)

## Quick start

- install and initialize

  - install netlify-cli globally

    ```sh
    $ npm install netlify-cli -g
    ```

  - install module

    ```sh
    $ npm i
    ```

  - create `.env.local` file for netlify functions development

    ```sh
    touch .env.local
    ```

    - copy [.env.defaults variable](https://github.com/jameshsu1125/template-netlify-mern/blob/main/.env.defaults) to `.env.local` file.

  - .create `.env.local` file for vite development

    ```sh
    touch src/pages/.env.local
    ```

    - copy [.env.defaults variable](https://github.com/jameshsu1125/template-netlify-mern/blob/main/src/pages/.env.defaults) to `.env.local` file.

- development

  - start `vite` (front-end)

    ```sh
    $ npm run dev
    ```

  - start `netlify functions` (back-end)

    ```sh
    $ npm run serve
    ```

  - start together ( `vite` + `netlify functions`)

    ```sh
    $ npm run dev:serve
    ```

    _sometimes netlify-cli or vite-cli will crash_

  - design your schema and types

    <b><i> Edit [setting/index.ts](https://github.com/jameshsu1125/template-netlify-mern/blob/main/setting/index.ts) for your database schema. </i></b>

- build and deployment

  - build static pages

    ```sh
    $ npm run build
    ```

  - deploy on `netlify`

    - create `Netlify` site

      ```sh
      netlify sites:create
      ```

    - or link `Netlify` site id

      ```sh
      netlify link
      ```

    - set `Netlify` environment variables same as `.env.local`.

      <img src="./misc/screenshot-1.png" alt="Netlify set environment variables" />

    - deploy `Netlify` functions.

      ```sh
      $ npm run deploy
      ```

      **_check more detail for [Netlify cli](https://docs.netlify.com/cli/get-started/)_**

## Status

- Development since November 2023
- use [vite](https://vitejs.dev/) for development environment and bundler.
- use [React](https://react.dev/) for main javascript library.
- use [Typescript](https://www.typescriptlang.org/) for syntax.
- use [LessCSS](https://lesscss.org/) and [TailwindCSS](https://tailwindcss.com/) for css library.
- use [ESLint](https://eslint.org/) rules for coding style.
- use [Mocks](https://mswjs.io/) and [faker](https://fakerjs.dev/) for testing API.
- use [Netlify](https://www.netlify.com/) for deployment.
- use [Express](https://expressjs.com/) for api router.

## What's included

- `public` folder will copy to `/dist`
- `src` folder is reactJs entry point. default file is named as `pages/index.tsx`
- `netlify/functions` folder for express and Netlify functions source code.
- `setting/index.ts` config for schema and typescript setting.

## Bugs and feature requests

- [Node](https://nodejs.org/en/) version must be above v18
- I will not maintain when this project is closed

## naming conventions rules

1. general variable - `Camel Case`
   > ex: _setState_、_currentTarget_、_pinkBackground_、_innerText_
2. react components and class name - `Pascal Case`.
   > ex: _RegularButton_、_NavigationBar_
3. global variable or state - `Pascal Case`.
   > ex: _Context_、_LandingState_
4. Immutable variable or environment variable - `Screaming Snake Case`.
   > ex: _PAGE_、<em>VITE_TITLE</em>
5. type - `I` = interface, `T` = type.
   > ex: _IProps_、_TResult_
6. enum options - `Pascal Case` + `"Type"`.
   > ex: _ActionType_、_AlertType_、_ModalType_
7. class name = `Snake Case`.
   > ex: _.button-group_、_.button-label_

[naming-conventions](https://medium.com/@code.ceeker/naming-conventions-camel-case-pascal-case-kebab-case-and-more-dc4e515b9652)

## Contributing

Please read through our [contributing guidelines](https://github.com/github/docs/blob/main/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

Moreover, all HTML and CSS should conform to the [Code Guide](https://github.com/airbnb/javascript), maintained by [Main author](https://github.com/jameshsu1125).

## Creators

**maintainer, developer**

- [James Hsu](https://github.com/jameshsu1125)

## Thanks

Thank customers and some manufacturers for their support.

## Copyright and license

Code and documentation copyright 2011-2022 the authors. Code released under the [MIT License](https://reponame/blob/master/LICENSE).

<!-- open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security -->
