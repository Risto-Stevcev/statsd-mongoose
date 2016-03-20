const lynx = require('lynx')

module.exports = function(schema, options) {
  // The default namespace function
  const defaultNs = (model, method) => `db.${model.toLowerCase()}.${method}`

  // Set defaults
  options = options || {}
  options.ns      = options.ns      || defaultNs
  options.host    = options.host    || 'localhost'
  options.port    = options.port    || 8125
  options.timers  = options.timers  || {}
  options.metrics = options.metrics || new lynx(options.host, options.port)

  // Set the `pre` and `post` hooks for mongoose methods
  ;[ 'find', 'findOne', 'findOneAndUpdate', 'findOneAndRemove'
   , 'save', 'update',  'remove' ].forEach(method => {
    schema.pre(method, function(next) {
      const model = this.constructor.modelName || this.model.modelName
          , ns    = options.ns.call(this, model, method)
      options.timers[ns] = options.metrics.createTimer(ns)
      next()
    })

    schema.post(method, function() {
      const model = this.constructor.modelName || this.model.modelName
          , ns    = options.ns.call(this, model, method)
      if (options.timers[ns]) {
        options.timers[ns].stop()
        delete options.timers[ns]
      }
    })
  })
}
