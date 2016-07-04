/*jshint node:true*/
'use strict';
var http = require('http');
var format = require('format');

var GAMEDAY_HOST = 'gd2.mlb.com';

function getBasePath( date ) {

  return format('/components/game/mlb/year_%s/month_%s/day_%s/',
                    date.getFullYear(),
                    _padToTwoDigits( date.getMonth() + 1 ),
                    _padToTwoDigits( date.getDate() )
                  );

  function _padToTwoDigits( integer ) {
    return ( '0' + integer ).slice( -2 );
  }

}

function request( path, callback ) {

  var options = {
    host: GAMEDAY_HOST,
    port: 80,
    path: path
  };

  var _httpCallback = function( response ) {
    var body = '';

    response.on('data', function (chunk) {
      body += chunk;
    });

    response.on('end', function () {
      callback( false, response, body );
    });
  };

  var req = http.request( options, _httpCallback );

  req.on('error', function(){
    callback( true );
  });
  req.end();
}

module.exports.getSchedule = function getSchedule( date, callback ) {

  if ( typeof( date ) === 'undefined' ) {
    date = new Date();
  }

  var path = getBasePath( date ) + 'master_scoreboard.json';

  request( path, _digestSchedule );

  function _digestSchedule( error, response, body ) {
    var schedule;
    if (!error && response.statusCode === 200) {
      try {
        schedule = JSON.parse( body ).data.games.game;
      } catch ( e ) {
        console.log('error parsing response');
        callback( true );
        return;
      }
      callback( false, schedule );
    }
    else {
      console.log('error retrieving gameday data: ' + error.toString() );
      callback( true );
    }
  }

};
