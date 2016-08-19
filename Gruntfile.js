"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist'],
    concat: {
      options: {
        separator: '\n;\n\n'
      },
      dist: {
        src: [
          'src/weraise.prefix',
          'src/lib/**/*',
          'src/weraise.js',
          'src/weraise.suffix'
        ],
        dest: 'dist/weraise-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> (License: <%= pkg.license %>) */\n',
        sourceMap: true
      },
      weraise: {
        src: 'dist/weraise-<%= pkg.version %>.js',
        dest: 'dist/weraise-<%= pkg.version %>.min.js'
      }

    }
  });

  // Plugin Tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Build
  grunt.registerTask('build', [
    'clean',
    'concat',
    'uglify'
  ]);

  // Default task(s).
  grunt.registerTask('default', ['build']);

};
