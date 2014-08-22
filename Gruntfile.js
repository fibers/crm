var path = require('path');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bower: {
            install: {
                options: {
                    cleanTargetDir: false,
                    targetDir: 'public/dev',
                    verbose: true,
                    layout: function (type, component) {
                        return type;
                    }
                }
            }
        },

        jshint: {
            files: [
                './*.js', '*/*.js', './models/*/*.js',
                'public/dev/javascripts/main.js',
                'public/dev/javascripts/login.js',
                '!bower_components/**/*.js', '!node_modules/**/*.js'
            ],
            options: {
                shadow: true
            }
        },

        uglify: {
            options: {
                mangle: false,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
                compress: {
                    drop_console: true
                }
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/dev/javascripts',
                        src: ['*.js', '!*.min.js'],
                        dest: 'public/prod/javascripts/',
                        ext: '.js',
                        extDot: 'last'
                    }
                ]
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'public/dev/stylesheets/',
                src: ['*.css', '!*.min.css'],
                dest: 'public/prod/stylesheets/',
                ext: '.css',
                extDot: 'last'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/dev/fonts/',
                        src: ['*'],
                        dest: 'public/prod/fonts/',
                        filter: 'isFile'
                    }
                ]
            },
            official_js: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components',
                        src: ['*/dist/**/*.min.js'],
                        dest: 'public/prod/javascripts/',
                        filter: 'isFile',
                        rename: function (dest, src) {
                            var basename = path.basename(src);
                            return path.join(dest, basename.replace('.min', ''));
                        }
                    }
                ]
            },
            official_css: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components',
                        src: ['*/dist/**/*.min.css','*/dist/**/*.css.map'],
                        dest: 'public/prod/stylesheets/',
                        filter: 'isFile',
                        rename: function (dest, src) {
                            var basename = path.basename(src);
                            return path.join(dest, basename.replace('.min', ''));
                        }
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['bower', 'jshint', 'uglify', 'cssmin', 'copy']);
};