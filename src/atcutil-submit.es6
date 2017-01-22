#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import client from 'cheerio-httpcli'
import program from 'commander'
import user_settings from 'user-settings'

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
const source_dir = path.isAbsolute( program.args[0] ) ? '' : './';
const source_path = source_dir + program.args[0]

const cwd = process.cwd();
const task = program.task ? program.task :
                            path.basename( cwd );
const contest = program.contest ? program.contest :
                                  path.basename( path.dirname( cwd ) );

function find_task_id( $, task )
{
    if( 1 < task.indexOf('_') )
    {
        throw "invalid task";
    }

    const task_index =  task[0].charCodeAt() - 'A'.charCodeAt()

    const form = $('form');
    const task_id = $(form.find('select[name=task_id]').children().get( task_index )).attr('value');
    return task_id;
}

function find_language_value( $, task_id, source_path )
{
    const ext = path.extname( source_path );
    const regex_table = {
        '.java' : /Java([^)]*)/,
        '.py'   : /Python([^)]*)/,
        '.pl'   : /Perl([^)]*)/,
        '.c'    : /C(Clang [0-9.]+)/,
        '.hs'   : /Haskell([^)]*)/,
        '.go'   : /GO([^)]*)/,
        '.cs'   : /C#([^)]*)/,
        '.cpp'  : /C\+\+11(Clang\+\+ [0-9.]+)/,
        '.fsx'  : /F#([^)]*)/,
    };

    if( !( ext in regex_table ) )
    {
        throw "invalid language";
    }
    const r = regex_table[ ext ];

    const objs = $('form').find(`select[name=language_id_${task_id}]`).children();
    for(let i = 0; i < objs.length; ++i )
    {
        const item = $(objs.get( i ));
        if( r.test( item.text() ) )
        {
            return item.attr('value');
        }
    }

    throw "invalid language";
}

function get_language_value_prefix( source_path )
{

    return ext_table[ext];
}

const cookie = settings.get('Cookie');
if(cookie)
{
    client.headers['Cookie'] = cookie;
}

fs.readFile( source_path, ( rd_err, rd_data ) => {
    client.fetch( common_util.get_url( contest, 'submit' ), ( err, $, res ) => {
        const task_id = find_task_id( $, task );
        const language_id = find_language_value( $, task_id, source_path );

        const field = {
            'task_id' : task_id,
            [`language_id_${task_id}`] : language_id,
            'source_code' : rd_data
        };

        $('form').field(field)
                 .find('button[type=submit]')
                 .click( ( err, $, res ) => {
            const message = err ? 'Submit failure' : 'Submit successful';
            console.log( message );
        });
    });
});
