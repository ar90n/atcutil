#!/usr/bin/env node

import prompt from 'prompt'
import fs from 'fs'
import path from 'path'
import client from 'cheerio-httpcli'
import program from 'commander'
import user_settings from 'user-settings'

import common_util from './common_util.js'

let settings = user_settings.file( '.atcutil' );

program
    .option('-u, --user [user]', 'user' )
    .option('-p, --password [password]', 'password' )
    .parse( process.argv );

let properties = []
if( !program.user )
{
    properties.push( {
        name : 'username',
    });
}

if( !program.password )
{
    properties.push( {
        name : 'password',
        hidden : true
    });
}

prompt.start();

prompt.get( properties, (err,result) => {
    const username = program.user ? program.user : result.username;
    const password = program.password ? program.password : result.password;
    client.fetch( common_util.get_url( 'practice', 'login' ), ( err, $, res ) => {
        let form = $('form');
        form.field({
            'name' : username,
            'password' : password
        });

        form.find('button[type=submit]').click( ( err, $, res ) => {
            const cookies = res.cookies;

            let is_login_successful = false;
            let cookie_str = "";
            for( let key in cookies )
            {
                if( key.startsWith( '__message' ) )
                {
                    is_login_successful = JSON.parse( decodeURIComponent( cookies[key] ) )['t'];
                }
                else
                {
                    cookie_str += key + '=' + cookies[key] + ';';
                }
            }

            if( is_login_successful )
            {
                settings.set( 'Cookie', cookie_str );
                console.log( 'Login successful' );
            }
            else
            {
                console.error( 'Login failure' );
            }
        });
    });
});
