# Vue Chat Widget POC

## Install app dependencies
```bash
npm install
```

## Add this widget code snippet in index.html of dev folder 
```
    <script> 
        (function (w, d, s, o, f, js, fjs) {
            w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
            js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
            js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
        }(window, document, 'script', '_hw', './widget.js'));
        _hw('init', { tenant: {name: 'de schoor', id: 1}, text: {title: 'De Schoor Chat' }});
    </script>
```

## Run your project in developer mode
```bash
npm run dev
```

## Build your project
```bash
npm run build
```
- After the build, you can deploy the files from the dist folder. 
- Pay attention to the index.html (of the dist folder) for the widget code snippet. You may need to add the url of your website for the widget.js

```bash
    <script> 
        (function (w, d, s, o, f, js, fjs) {
            w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
            js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
            js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
        }(window, document, 'script', '_hw', 'https://yourwebsite.com/widget.js'));
        _hw('init', { tenant: {name: 'de schoor', id: 1}, text: {title: 'De Schoor Chat' }});
    </script>
```

## Articles

- https://blog.jenyay.com/building-javascript-widget/
- https://blog.jenyay.com/web-ui-widget/


