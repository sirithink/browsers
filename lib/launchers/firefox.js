'use strict';

var fs = require('fs')
var util = require('util')
var path = require('path')
var spawn = require('child_process').spawn
var rimraf = require('rimraf')
var logger = require('totoro-common').logger

var helper = require('../helper')

var PREFS =
  'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
  'user_pref("dom.disable_open_during_load", false);\n' +
  'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n'


// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var BaseFirefox = function() {
  this.name = 'firefox'

  this.start = function(url) {
    var that = this
    this.createProfile(function(profileDir) {
      that.execCommand(that.getCommand(), that.getOptions(url, profileDir))
    })
  }

  this.getOptions = function(url, profileDir) {
    return [url, '-profile', profileDir, '-no-remote']
  }

  this.createProfile = function(cb) {
    var profileDir = this.tempDir + this.name
    if (fs.existsSync(profileDir)) {
    fs.createWriteStream(profileDir + path.sep + 'prefs.js', {flags: 'a'}).write(PREFS)
      cb(profileDir)
      return
    }

    var p = spawn(this.getCommand(), ['-CreateProfile', 'totorojs-' + this.name + ' ' + profileDir, '-no-remote'])

    var errorOutput = ''
    p.stderr.on('data', function(data) {
      errorOutput += data.toString()
    })

    p.on('close', function() {
      var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput)

      if (match) {
        profileDir = match[1]
      }
      cb(profileDir)
    })
  }
}

// PUBLISH
module.exports = BaseFirefox