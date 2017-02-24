module.exports = function (grunt) {

    /*
     * Configuration settings
     */
    var bowerPaths = {
        bowerrc: '.bowerrc',
        bowerDirectory: 'bower_components',
        bowerJson: 'bower.json'
    };

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync-json');
    grunt.loadNpmTasks('grunt-bower-install-simple');
    grunt.loadNpmTasks('main-bower-files');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-publish');
    grunt.loadNpmTasks('grunt-bump');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'sync-json': {
            options: {
                indent: 2,
                include: [
                    'name', 'version', 'description', 'authors', 'main', 'repository', 'keywords', 'license', 'private'
                ]
            },
            dep: {
                files: {
                    'bower.json': 'package.json'
                }
            }
        },

        /*
         * Task used to install bower dependencies.
         */
        'bower-install-simple': {
            dep: {
                options: {
                    production: false
                }
            }
        },

        /*
         * Modify the bower dependencies and move the needed files to the
         * target location.
         */
        bower: {
            dep: {
                options: {
                    includeDev: true,
                    checkExistence: true,
                    paths: bowerPaths,
                    overrides: {
                        'r.js': {main: ['dist/r.js']},
                        'js-misc': {ignore: true},
                        'js-svglibrary': {ignore: true}
                    }
                },
                dest: 'www-root/scripts'
            }
        },

        /*
         * The watch tasks observes changes on the file-system, which
         * allow us to see changes directly in the browser.
         *
         * Set spawn == false, ee documentation: Setting this option to false speeds
         * up the reaction time of the watch (usually 500ms faster
         * for most)
         */
        watch: {
            server: {
                options: {
                    livereload: true,
                    spawn: false
                },

                // define the task to run when a change happens
                tasks: ['01-resolve-dependencies', 'copy:setup'],

                // files to observe, can be an array
                files: ['gruntfile.js', 'package.json', 'src/**/*', 'public/**/*', 'test/**/*']
            },
            dist: {
                options: {
                    livereload: true,
                    spawn: false
                },

                // define the task to run when a change happens
                tasks: ['02-compile-sources', 'copy:dist'],

                // files to observe, can be an array
                files: ['public/testDistribution*.html', 'src/Optimizer.js']
            }
        },

        /*
         * The connect task starts a web server for us to see our results and
         * do some testing.
         */
        connect: {
            server: {
                options: {
                    port: '<%= server.port %>',
                    base: 'www-root'
                }
            },
            dist: {
                options: {
                    port: '<%= server.port %>',
                    base: 'www-dist'
                }
            }
        },

        /*
         * Copies the files into the right location for the web server.
         */
        copy: {
            dep: {
                files: [
                    {expand: true, flatten: false, cwd: bowerPaths.bowerDirectory + '/js-misc/src', src: '**/*', dest: 'www-root/scripts'},
                    {expand: true, flatten: false, cwd: bowerPaths.bowerDirectory + '/js-svglibrary/src', src: '**/*', dest: 'www-root/scripts'}
                ]
            },
            setup: {
                files: [
                    {expand: true, flatten: false, cwd: 'src', src: '**/*', dest: 'www-root/scripts'},
                    {expand: true, flatten: false, cwd: 'test', src: '**/*', dest: 'www-root/scripts'},
                    {expand: true, flatten: false, cwd: 'public', src: '**/*', dest: 'www-root'}
                ]
            },
            dist: {
                files: [
                    {expand: true, flatten: false, cwd: bowerPaths.bowerDirectory + '/jquery/dist', src: 'jquery.min.js', dest: 'www-dist/scripts'},
                    {expand: true, flatten: false, cwd: 'dist', src: '**/*', dest: 'www-dist/scripts'},
                    {expand: true, flatten: false, cwd: 'public/css', src: '**/*', dest: 'www-dist/css'},
                    {expand: true, flatten: false, cwd: 'public', src: 'testDistribution*.html', dest: 'www-dist'}
                ]
            }
        },

        execute: {
            compile: {
                call: function (grunt, option, async) {
                    var requirejs = require('requirejs');
                    var extend = require('util')._extend;
                    var fs = require('fs');

                    var done = async();
                    var currentDir = process.cwd();
                    var prefixFilename = currentDir + '/dist/' + grunt.config('pkg.name');

                    var baseConfig = {
                        baseUrl: 'scripts',
                        name: 'almond',
                        include: 'Optimizer',
                        wrap: true
                    };

                    var optimize = function (config, callback) {

                        requirejs.optimize(config, function () {
                            callback(true);
                        }, function (err) {
                            grunt.log.error(err);
                            callback(false);
                        });
                    };

                    var cleanUp = function () {
                        process.chdir(currentDir);
                        done();
                    };

                    // run the actual optimization
                    process.chdir('www-root');
                    optimize(extend({
                        optimize: 'none',
                        out: prefixFilename + '.js'
                    }, baseConfig), function (success) {

                        if (success) {
                            optimize(extend({
                                out: prefixFilename + '.min.js'
                            }, baseConfig), cleanUp);
                        } else {
                            cleanUp();
                        }
                    });
                }
            }
        },

        publish: {
            options: {
                ignore: ['node_modules', 'bower_components']
            },
            deploy: {
                src: './'
            }
        },

        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commitFiles: ['.'],
                pushTo: 'origin'
            }
        }
    });

    grunt.registerTask('01-resolve-dependencies', 'Resolve all the dependencies', function () {
        grunt.task.run('sync-json:dep', 'bower-install-simple:dep', 'bower:dep', 'copy:dep');
    });

    grunt.registerTask('02-compile-sources', 'Update the current root-directory', function () {
        grunt.task.run('01-resolve-dependencies', 'copy:setup', 'execute:compile');
    });

    grunt.registerTask('04-deploy', 'Update the current root-directory', function () {
        grunt.config.set('log.msg', 'Make sure your bower project is registered using: ' + '\n' +
            '$ bower register ' + grunt.config('pkg.name') + ' ' + grunt.config('pkg.repository.bump') + '\n' +
            'Make sure your npm users are added: ' + '\n' +
            '$ npm adduser');

        grunt.task.run('02-compile-sources', 'log', 'bump', 'publish:deploy');
    });

    grunt.registerTask('98-run-server', 'Start the web-server for fast debugging.', function (port) {
        port = typeof port === 'undefined' || port === null || isNaN(parseFloat(port)) || !isFinite(port) ? 20000 : parseInt(port);
        grunt.config.set('server.port', port);
        grunt.config.set('log.msg', 'You may want to start the sample server providing data via JSON, ant 98-run-server (see server)' + '\n' +
            'For an example: http://localhost:' + port + '/index.html');

        grunt.task.run('01-resolve-dependencies', 'copy:setup', 'connect:server', 'log', 'watch:server');
    });

    grunt.registerTask('99-run-dist-server', 'Runs a server with the dist-version', function (port) {
        port = typeof port === 'undefined' || port === null || isNaN(parseFloat(port)) || !isFinite(port) ? 20000 : parseInt(port);
        grunt.config.set('server.port', port);
        grunt.config.set('log.msg', 'Test the distribution: http://localhost:' + port + '/testDistributionNoJQuery.html' + '\n' +
            '                       http://localhost:' + port + '/testDistributionWithJQuery.html');

        grunt.task.run('02-compile-sources', 'copy:dist', 'connect:dist', 'log', 'watch:dist');
    });

    grunt.registerTask('log', 'Writes a log messages', function () {
        grunt.log.writeln(grunt.config.get('log.msg'));
    });
};