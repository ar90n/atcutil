#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import client from 'cheerio-httpcli'
import program from 'commander'
import user_settings from 'user-settings'

import './common_util.js'
import common_util from './common_util.js'

let settings = user_settings.file( '.atcutil' );

program
    .option('-t, --task [task]','task')
    .option('-c, --contest [contest]','contest')
    .parse(process.argv);

if( program.args.length != 1 )
{
    console.error('source code is required.');
    process.exit(1);
}
const source_path = program.args[0];

const cwd = process.cwd();
const task = program.task ? program.task :
                            path.basename( cwd );
const contest = program.contest ? program.contest :
                                  path.basename( path.dirname( cwd ) );

function get_task_index( task )
{
    if( 1 < task.length )
    {
        throw "invalid task";
    }

    return task[0].charCodeAt() - 'A'.charCodeAt()
}

function get_language_index( source_path )
{
    const ext = path.extname( source_path );
    const ext_table = {
        '.c'    : 1,
        '.cc'   : 2,
        '.cpp'  : 2,
        '.cs'   : 5,
        '.hs'   : 13,
        '.java' : 14,
        '.php'  : 20,
        '.py'   : 37,
    };

    if( !( ext in ext_table ) )
    {
        throw "invalid language";
    }

    return ext_table[ext];
}

const cookie = settings.get('Cookie');
if(cookie)
{
    client.headers['Cookie'] = cookie;
}

fs.readFile( source_path, ( rd_err, rd_data ) => {
    client.fetch( get_url( contest, 'submit' ), ( err, $, res ) => {
        const form = $('form');
        const task_index = get_task_index( task );
        const language_index = get_language_index( source_path );
        const task_id = $(form.find('select[name=task_id]').children().get( task_index )).attr('value');
        const language_id_name = `language_id_${task_id}`;
        const language_id = $(form.find(`select[name=${language_id_name}]`).children().get( language_index )).attr('value');

        let field = {}
        field['task_id'] = task_id;
        field[language_id_name] = language_id;
        field['source_code'] = rd_data;
        form.field(field);

        form.find('button[type=submit]').click( ( err, $, res ) => {
            const message = err ? 'Submit successful' : 'Submit failure';
            console.log( message );
        });
    });
});
