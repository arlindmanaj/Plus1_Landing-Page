# Plus1 landing page

The Albanian page is `index.html`. English, German and Macedonian pages are
served from `en/`, `de/` and `mk/`. The header links work without JavaScript.

After changing Albanian copy, update the corresponding entries in
`translations.mjs` and run:

```sh
node build-translations.mjs
```

Deploy the entire directory, including the three language folders. No runtime
or package installation is required on the host. The generator checks that all
translation entries still match the Albanian source before writing pages.
