#!/usr/bin/env node

import packagejson from './package.json'
import program from 'commander'

program
    .version(packagejson.version)
    .command('fetch [contest]', 'featch contest')
    .command('submit [file]', 'submit file')
    .command('test [exec]', 'test execution file')
    .command('login', 'login')
    .parse(process.argv);
