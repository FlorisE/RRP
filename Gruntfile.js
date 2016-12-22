module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    ts: {
      app: {
        files: [{
          src: ["models/**/*.ts"],
          dst: "."
        }],
        options: {
          module: "commonjs",
          target: "es6",
          sourceMap: false
        }
      }
    },
    tslint: {
      options: {
        configuration: "tslint.json"
      },
      files: {
        src: ["models/**/*.ts"]
      }
    },
    watch: {
      ts: {
        files: ["models/**/*.ts"],
        tasks: ["ts", "tslint"]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');

  grunt.registerTask('default', ['ts', 'tslint']);
};