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
*Note: If bower fails on any packages, this may have to do with server overload. Running bower install again may correct the issue.*



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




*Note: The default task for grunt is to build then devel.*
