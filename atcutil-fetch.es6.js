#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import client from 'cheerio-httpcli'
import program from 'commander'

program
    .parse(process.argv);

const contests = program.args;
if( !contests.length )
{
    console.error('contests required');
    process.exit(1);
}

function get_url( contest, path )
{
    return 'http://' + contest + '.contest.atcoder.jp/' + path;
}

contests.forEach( contest => {
    fs.mkdir( contest, err => {
        client.fetch( get_url(contest, 'assignments'), ( err, $, res ) => {
            $('tbody tr').each( function( idx, el ) {
                const linkwrappers = $(el).find('.linkwrapper');
                const task_index = $(linkwrappers.get(0)).text();
                const task_name  = $(linkwrappers.get(1)).text();
                const task_path  = $(linkwrappers.get(1)).attr('href');
                const dir_name = task_index + '_' + task_name;
                fs.mkdir( path.join( contest, dir_name ), err => {
                    const task_page_url = get_url(contest, task_path);
                    client.fetch( task_page_url, (err, $, res ) => {
                        $('section').each( function( idx, el ) {
                            const section_title   = $($(el).children().get(0)).text().trim();
                            const section_content = $($(el).children().get(1)).text().trim();

                            const input_match  = /入力例\s*(\d)/.exec( section_title );
                            const output_match = /出力例\s*(\d)/.exec( section_title );
                            const section_file_name = input_match  ? `in_${input_match[1]}.txt`:
                                                   output_match ? `out_${output_match[1]}.txt`:
                                                   null;
                            if( section_file_name )
                            {
                                fs.writeFile( path.join( contest, dir_name, section_file_name ), section_content, err => {
                                    if(err)
                                    {
                                        console.log( err );
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
