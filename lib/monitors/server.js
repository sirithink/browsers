'use strict';

var util = require('util')
var http = require('http')
var EventEmitter = require('events').EventEmitter

var common = require('totoro-common')
var logger = common.logger


module.exports = ServerMonitor


function ServerMonitor(capture) {
  if (capture.indexOf('http') !== 0) {
    capture = 'http://' + capture
  }
  this.capture = capture
  this._prev = 1
  this.start()
}

util.inherits(ServerMonitor, EventEmitter)

var instances = {}

ServerMonitor.get = function(capture) {
  return instances[capture] ||
      (instances[capture] = new ServerMonitor(capture))
}

ServerMonitor.prototype.start = function() {
  if (this.timer) return

  var that = this
  this.timer = setInterval(function() {
    http.get(that.capture, function(res) {
      that._handleStatus(res.statusCode)
    }).on('error', function(e) {
      that._handleStatus()
    })
  }, 10000)
}

ServerMonitor.prototype.stop = function() {
  if (!this.timer) return

  clearInterval(this.timer)
  ;delete this.timer

  this._prev = 1
}

ServerMonitor.prototype._handleStatus = function(code) {
  var cur = 0
  if (code && code > 199 && code < 400) cur = 1

  if (this._prev && !cur) {
    logger.info('Server disconnected.')
    this.emit('disconnected')

  } else if (!this._prev && cur) {
    logger.info('Server connected.')
    this.emit('connected')
  }

  this._prev = cur
}
