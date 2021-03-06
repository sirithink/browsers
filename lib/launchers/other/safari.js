'use strict';

var fs = require('fs')
var path = require('path')
var util = require('util')

var BaseBrowser = require('./Base')
var helper = require('../helper')

var SafariBrowser = function() {
    BaseBrowser.apply(this, arguments)

    this.start = function(url) {
        var HTML_TPL = path.normalize(__dirname + '/../../static/safari.html')
        var that = this
        var id = this.id

        fs.readFile(HTML_TPL, function(err, data) {
            var content = data.toString().replace('%URL%', url)
            var staticHtmlPath = that.tempDir + that.name + '/redirect.html'
            fs.writeFile(staticHtmlPath, content, function(err) {
                that._execCommand(that._getCommand(), [staticHtmlPath])
            })
        })
    }
}

util.inherits(SafariBrowser, BaseBrowser)

helper.extend(SafariBrowser.prototype, {
    name: 'Safari',

    DEFAULT_CMD: {
        darwin: '/Applications/Safari.app/Contents/MacOS/Safari',
        win32: process.env.ProgramFiles + '\\Safari\\safari.exe'
    },
    ENV_CMD: 'SAFARI_BIN'
})


// PUBLISH
module.exports = SafariBrowser
