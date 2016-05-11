#!/usr/bin/env node

import glob from 'glob'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import program from 'commander'

import common_util from './common_util.js'

program
    .option('-d, --directory [directory]','Set working directory')
    .parse(process.argv);

if( program.args.length != 1 )
{
    console.error('execution is required.');
    process.exit(1);
}
const execution_path = program.args[0];

const work_dir = program.directory ? program.directory : '.'
const glob_pattern = path.join(work_dir, '?(in_*.txt|out_*.txt)')
const g = new glob.Glob( glob_pattern, (err,result) => {
    if(err)
    {
        g.abort();
        console.error('');
        process.exit(1);
    }

    let io_files = {};
    result.forEach( (element, index, array) => {
        const name_body = path.basename(element, '.txt');
        const del_index = name_body.indexOf('_');
        const file_type = name_body.slice( 0, del_index );
        const file_key  = name_body.slice( del_index + 1 );

        if(!io_files[file_key])
        {
            io_files[file_key] = {};
        }
        io_files[file_key][file_type] = element;
    });

    for( let key in io_files )
    {
        if( !!io_files[key]['in'] && !!io_files[key]['out'] )
        {
            fs.readFile( io_files[key]['in'], ( input_data_err, input_data ) => {
                if(input_data_err)
                {
                    throw input_data_err;
                }

                fs.readFile( io_files[key]['out'], ( output_data_err, output_data ) => {
                    if(output_data_err)
                    {
                        throw output_data_err;
                    }

                    const command = execution_path;
                    const child = child_process.spawn( command );
                    child.stdout.on( 'data', (data) => {
                        const result = ( data.toString() === output_data.toString() ) ? 'OK' : 'FAILURE';
                        const result_str = `${io_files[key]['in']} ... ${result}`;
                        console.log( result_str );
                    });
                    child.stdin.write( input_data );
                    child.stdin.end();
                });
            });
        }
    }
});
