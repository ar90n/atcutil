#!/usr/bin/env node

import packagejson from './package.json'
import program from 'commander'

program
    .version(packagejson.version)
    .command('fetch [contest]', 'featch contest')
    .command('submit [file]', 'submit file')
    .command('test', 'test')
    .parse(process.argv);
