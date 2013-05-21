torpchat
========

A web based IRC client, using nodejs as the bouncer with socket.io as the client/bouncer transport.



Installation
------------

Install grunt command-line and bower both globally

```bash
npm install -g grunt-cli && npm install -g bower
```

Install required node modules

```bash
cd torpchat && npm install
```

Install the client-side modules with bower

```bash
bower install
```


Build
-----

```bash
grunt build
```


Develop
-------

```bash
grunt devel
```




-note- default task for grunt is to build then devel
