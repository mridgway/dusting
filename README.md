# dusting

compiles dust.js templates

## installation

For use in other node projects:

    npm install dusting

As a command line tool:

    npm install dusting -g

## usage

in a node project (designed to be used synchronously):

    var dusting = require('dusting');
    dusting({
      source: <input>,
      output: <output>
    });

command line:

    dusting <input> [output]

 - `<source>` path to a directory containing dust.js templates (`*.dust`).
 - `[output]` directory to write output to, defaults to cwd