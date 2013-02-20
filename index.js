var diveSync = require('diveSync')
  , fs = require('fs')
  , path = require('path')
  , dust = require('dustjs-helpers');

function dustify(file, basename, whitespace) {
  var filename = path.basename(file, '.dust');
  return dust.compile(fs.readFileSync(file, 'utf-8'), basename+filename, whitespace);
}

module.exports = function(config) {
  var cwd = process.cwd()
    , output = '', dir, filename
    , compile = { root:[], sub:{}};

  config.source = path.normalize(path.resolve(cwd, config.source));
  config.output = path.normalize(path.resolve(cwd, config.output));
  config.rootOutput = config.rootOutput || 'templates.js';
  config.rootOutput = path.normalize(path.join(config.output, config.rootOutput));

  diveSync(config.source, {recursive: true, directories: false}, function(err, file) {
    // only work with dust files
    if( path.extname(file) !== '.dust') return false;
    basename = path.relative(config.source, file);
    dir = '';
    if(basename.indexOf(path.sep) !== -1) {
      dir = path.dirname(basename);
      dir = dir.replace(/\//g, ".")
    }
    if(dir) {
      compile.sub[dir] = compile.sub[dir] || [];
      compile.sub[dir].push({name:basename,fn:dustify(file, dir+'.', config.whitespace)});
    } else {
      compile.root.push({name:basename,fn:dustify(file, dir, config.whitespace)});
    }
  });

  console.log('dusting');
  console.log('source: '+config.source);
  console.log('output: '+config.output);
  console.log();
  compile.root.forEach(function(file){
    output = output + file.fn + "\n";
    console.log('+ '+file.name);
  });

  if(output) {
    fd = fs.openSync(config.rootOutput, "w");
    fs.writeSync(fd, output, 0, "utf8");
    console.log('|');
    console.log('`---> '+path.relative(config.output, config.rootOutput));
    console.log('');
  }

  for (var dir in compile.sub) {
    output = '';
    compile.sub[dir].forEach(function(file){
      output = output + file.fn + "\n";
      console.log('+ '+file.name);
    });
    filename = path.join(config.output, dir + '.js');
    fd = fs.openSync(filename, "w");
    fs.writeSync(fd, output, 0, "utf8");
    console.log('|');
    console.log('`---> '+path.relative(config.output, filename));
    console.log('');
  };
}