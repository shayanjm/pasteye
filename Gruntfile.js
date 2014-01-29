'use strict';
var LIVERELOAD_PORT = 35729;
var path = require('path');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/front//{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/front//**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var pasteyeConfig = {
        app: 'app',
        dist: 'dist'
    };

    try {
        pasteyeConfig.app = require('./bower.json').appPath || pasteyeConfig.app;
    } catch (e) {}

    grunt.initConfig({
        pasteye: pasteyeConfig,
        watch: {
            coffee: {
            files: ['<%= pasteye.app %>/front/scripts/{,*/}*.coffee'],
            tasks: ['coffee:dist']
            },
            coffeeTest: {
            files: ['test/{,*/}*.coffee'],
            tasks: ['coffee:test']
            },
            livereload: {
            options: {
                livereload: LIVERELOAD_PORT
            },
            files: [
                '<%= pasteye.app %>/{,*/}*.html',
                '{.tmp,<%= pasteye.app %>}/front/styles/{,*/}*.css',
                '{.tmp,<%= pasteye.app %>}/front/scripts/{,*/}*.js',
                '<%= pasteye.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
            ]
            }
        },
    env : {
        options : {
        //Shared Options Hash
        },
        development: {
            NODE_ENV: 'development',
            src: '.env'
        },
        test: {
            NODE_ENV: 'test',
            src: '.env'
        },
        production: {
            NODE_ENV: 'production',
            src: '.env'
        }
    },
    express: {
        options: {
        port: 3000,
        hostname: '*'
        },
        livereload: {
        options: {
            livereload: true,
            server: path.resolve('app.js'),
            bases: [path.resolve('./.tmp'), path.resolve(__dirname, pasteyeConfig.app)]
        }
        },
        test: {
        options: {
            server: path.resolve('app.js'),
            bases: [path.resolve('./.tmp'), path.resolve(__dirname, 'test')]
        }
        },
        dist: {
        options: {
            server: path.resolve('app.js'),
            bases: path.resolve(__dirname, pasteyeConfig.dist)
        }
        }
    },
    open: {
        server: {
        url: 'http://localhost:<%= express.options.port %>'
        }
    },
    clean: {
        dist: {
        files: [{
            dot: true,
            src: [
            '.tmp',
            '<%= pasteye.dist %>/*',
            '!<%= pasteye.dist %>/.git*'
            ]
        }]
        },
        server: '.tmp'
    },
    jshint: {
        options: {
        jshintrc: '.jshintrc'
        },
        all: [
        '<%= pasteye.app %>/front/scripts/{,*/}*.js',
        'app.js',
        'db.js'
        ]
    },
    coffee: {
        dist: {
        files: [{
            expand: true,
            cwd: '<%= pasteye.app %>/front/scripts',
            src: '{,*/}*.coffee',
            dest: '.tmp/scripts',
            ext: '.js'
        }]
        },
        test: {
        files: [{
            expand: true,
            cwd: 'test/',
            src: '{,*/}*.coffee',
            dest: '.tmp/spec',
            ext: '.js'
        }]
        }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    concat: {
        options: {
            separator: '; \n'
        }
    },
    rev: {
        dist: {
            files: {
                src: [
                '<%= pasteye.dist %>/scripts/{,*/}*.js',
                '<%= pasteye.dist %>/styles/{,*/}*.css',
                '<%= pasteye.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                '<%= pasteye.dist %>/styles/fonts/*'
                ]
            }
        }
    },
    jade: {
    options: {
        pretty: true
    },
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: '<%= pasteye.app %>/front/views/',
            src: ['**/*.jade'],
            dest: '<%= pasteye.dist %>',
            ext: '.html'
          }
        ]
      },
      compile: {
        options: {
            data: {
            debug: true
          }
        }
      }
    },
    useminPrepare: {
        html: '<%= pasteye.dist %>/{,*/}*.html',
        options: {
            root: '<%= pasteye.app %>',
            dest: '<%= pasteye.dist %>'
        }
    },
    usemin: {
        html: ['<%= pasteye.dist %>/{,*/}*.html'],
        css: ['<%= pasteye.dist %>/styles/{,*/}*.css'],
        options: {
        dirs: ['<%= pasteye.dist %>']
        }
    },
    imagemin: {
        dist: {
        files: [{
            expand: true,
            cwd: '<%= pasteye.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg}',
            dest: '<%= pasteye.dist %>/images'
        }]
        }
    },
    cssmin: {
        options: {

        }
        // By default, your `index.html` <!-- Usemin Block --> will take care of
        // minification. This option is pre-configured if you do not wish to use
        // Usemin blocks.
        // dist: {
        //   files: {
        //     '<%= pasteye.dist %>/styles/main.css': [
        //       '.tmp/front/styles/{,*/}*.css',
        //       '<%= pasteye.app %>/front/styles/{,*/}*.css'
        //     ]
        //   }
        // }
    },
    htmlmin: {
        dist: {
        options: {
            /*removeCommentsFromCDATA: true,
            // https://github.com/pasteye/grunt-usemin/issues/44
            //collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true*/
        },
        files: [{
            expand: true,
            flatten: true,
            cwd: '<%= pasteye.app %>',
            src: ['*.html', 'front/views/partials/*.html'],
            dest: '<%= pasteye.dist %>/views/partials/'
        }]
        }
    },
    // Put files not handled in other tasks here
    copy: {
        dist: {
        files: [{
            expand: true,
            dot: true,
            cwd: '<%= pasteye.app %>/front',
            dest: '<%= pasteye.dist %>',
            src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{gif,webp,svg}',
            'styles/fonts/*'
            ]
        }, {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= pasteye.dist %>/images',
            src: [
            'generated/*'
            ]
        }, {
            expand: true,
            dot: true,
            cwd: '<%= pasteye.app %>/front',
            dest: '.tmp/',
            src: [
            'bower_components/**/*',
            'styles/**/*',
            'scripts/**/*'
            ]
        }]
        }
    },
    concurrent: {
        server: [
        'coffee:dist'
        ],
        test: [
        'coffee'
        ],
        dist: [
        'coffee',
        'imagemin',
        'htmlmin'
        ]
    },
    karma: {
        unit: {
        configFile: 'karma.conf.js',
        singleRun: true
        }
    },
    cdnify: {
        dist: {
        html: ['<%= pasteye.dist %>/*.html']
        }
    },
    ngmin: {
        dist: {
        files: [{
            expand: true,
            cwd: '<%= pasteye.dist %>/scripts',
            src: '*.js',
            dest: '<%= pasteye.dist %>/scripts'
        }]
        }
    },
    uglify: {
        options: {
            mangle: false
        },
        dist: {
        files: {
            '<%= pasteye.dist %>/scripts/scripts.js': [
            '<%= pasteye.dist %>/scripts/scripts.js'
            ]
        },
        }
    },
    mochaTest: {
        test: {
        options: {
            reporter: 'dot'
        },
        src: ['test/back/**/*.js']
        }
    }
    });

    grunt.registerTask('server', function (target) {
    if (target === 'dist') {
        return grunt.task.run(['build', 'open', 'express:dist', 'express-keepalive']);
    }

    grunt.task.run([
        'env:development',
        'clean:server',
        'concurrent:server',
        'express:livereload',
        'open',
        'watch'
    ]);
    });

    grunt.registerTask('test', [
    'env:test',
    'clean:server',
    'concurrent:test',
    'express:test',
    'insertTestUsers',
    'mochaTest',
    'karma',
    'dropTestTables'
    ]);

    grunt.registerTask('build', [
    'env:production',
    'clean:dist',
    'jade',
    'useminPrepare',
    'concurrent:dist',
    'copy',
    'concat',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'clean:server'
    ]);

    grunt.registerTask('insertTestUsers', function () {
        var done = this.async();
        var db = require('./app').db;
        require(__dirname + '/test/fix/Users.fix').insert(db, done);
    });

    grunt.registerTask('dropTestTables', function () {
        var done = this.async();
        var db = require('./db')();
        require(__dirname + '/test/fix/Users.fix').drop(db, done);
    });

    grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
    ]);
};
