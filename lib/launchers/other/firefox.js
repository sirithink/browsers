'use strict';

var fs = require('fs')
var util = require('util')
var spawn = require('child_process').spawn
var rimraf = require('rimraf')
var logger = require('totoro-common').logger

var BaseBrowser = require('./Base')
var helper = require('../helper')

var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("dom.disable_open_during_load", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n'


// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var FirefoxBrowser = function() {
    BaseBrowser.apply(this, arguments)
    var that = this

    this._start = function(url) {
        var that = this
        var id = this.id
        var command = this._getCommand()
        var errorOutput = ''
        var tempDir = this._tempDir + this.name
        if (!fs.existsSync(tempDir)) {
            var p = spawn(command, ['-CreateProfile', 'totorojs-' + this.name + ' ' + tempDir, '-no-remote'])

            p.stderr.on('data', function(data) {
                errorOutput += data.toString()
            })

            p.on('close', function() {
                var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput)

                if (match) {
                    that._errTempDir = match[1]
                }
            })
        } else {
            that._errTempDir = tempDir
            fs.createWriteStream(that._errTempDir + '/prefs.js', {flags: 'a'}).write(PREFS)
            that._execCommand(command, [url, '-profile', that._errTempDir, '-no-remote'])
        }
    }

    process.on('exit', function() {
        //logger.debug('Cleaning err temp dir %s', that._errTempDir)
        //rimraf(that._errTempDir, function(e) {logger.debug('rm------->', e)})
    })
}

util.inherits(FirefoxBrowser, BaseBrowser)

helper.extend(FirefoxBrowser.prototype, {
    name: 'Firefox',

    DEFAULT_CMD: {
        linux: 'firefox',
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        win32: process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe'
    },
    ENV_CMD: 'FIREFOX_BIN'
})

// PUBLISH
module.exports = FirefoxBrowser
