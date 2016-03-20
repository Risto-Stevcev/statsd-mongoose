# statsd-mongoose

[![Build Status](https://travis-ci.org/Risto-Stevcev/statsd-mongoose.svg)](https://travis-ci.org/Risto-Stevcev/statsd-mongoose)
[![Coverage Status](https://coveralls.io/repos/github/Risto-Stevcev/statsd-mongoose/badge.svg?branch=master)](https://coveralls.io/github/Risto-Stevcev/statsd-mongoose?branch=master)

:chart_with_upwards_trend: A statsd client for mongoose


## Usage

```js
const mongoose       = require('mongoose')
    , statsdMongoose = require('statsd-mongoose')

mongoose.connect('mongodb://some.mongo.uri:1234/db-name')
mongoose.plugin(statsdMongoose)
```

## Options

`host` - The statsd hostname (default: `'localhost'`)  
`post` - The statsd port (default: `8125`)  
`ns` - The function that gets called to generate the namespace. It binds `this` from the mongoose `pre` and `post` middleware, and passes in the `model` and `method` names as parameters. (default: ``(model, method) => `db.${model.toLowerCase()}.${method}` ``)

## How It Works

The plugin uses the statsd [lynx](https://www.npmjs.com/package/lynx) client to create `timer` metrics with mongoose `pre` and `post` middleware to record start/finish times.
Metrics are namespaced as `db.[collection-name].[method-name]`. See the [docs](http://risto-stevcev.github.io/statsd-mongoose/docs/statsd-mongoose.html) for more info.


## License

Licensed under the MIT license.
