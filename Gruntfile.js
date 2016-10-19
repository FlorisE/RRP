module.exports = function(grunt) {

    // list of libraries to be copied from the npm folder to the libs
    var npm_libraries = [
        {
            src: 'requirejs/require.js',
            dest: 'require.js'
        },
        {
            src: 'socket.io-client/socket.io.js',
            dest: 'socket.io.js'
        },
        {
            src: 'knockout/build/output/knockout-latest.js',
            dest: 'knockout.js'
        },
        {
            src: 'bootstrap3/dist/js/bootstrap.js',
            dest: 'bootstrap.js'
        },
        {
            src: 'jquery/dist/jquery.js',
            dest: 'jquery.js'
        },
        {
            src: 'knockout.validation/dist/knockout.validation.js',
            dest: 'knockout.validation.js'
        },
        {
            src: 'knockout-mapping/dist/knockout.mapping.js',
            dest: 'knockout.mapping.js'
        },
        {
            src: 'jsplumb/dist/js/jsPlumb-2.1.7.js',
            dest: 'jsplumb.js'
        }
    ];

    var npm_css = [
        {
            src: 'bootstrap3/dist/css/bootstrap.css',
            dest: 'bootstrap.css'
        }
    ];

    var npm_fonts = ['eot', 'svg', 'ttf', 'woff', 'woff2'].map(
        function (ext) {
            return {
                src: 'bootstrap3/dist/fonts/glyphicons-halflings-regular.'+ext,
                dest: 'glyphicons-halflings-regular.' + ext
            }
        }
    );

    files = npm_libraries.map(
        function(item) {
            return {
                src: 'node_modules/' + item.src,
                dest: 'public/js/lib/' + item.dest
            }
        }
    ).concat(
        npm_css.map(
            function(item) {
                return {
                    src: 'node_modules/' + item.src,
                    dest: 'public/css/' + item.dest
                }
            }
        )
    ).concat(
        npm_fonts.map(
            function(item) {
                return {
                    src: 'node_modules/' + item.src,
                    dest: 'public/fonts/' + item.dest
                }
            }
        )
    );

    grunt.initConfig({
        copy: {
            main: {
                files: files
            }
        },
        jshint: {
            files: [
                'Gruntfile.js',
                'public/js/models/*.js', // skip lib folder
                'public/js/*.js'
            ],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint']);
};