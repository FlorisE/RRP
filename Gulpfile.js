var gulp      = require('gulp');
var uglify    = require('gulp-uglify');
var concat    = require('gulp-concat');
var eslint    = require('gulp-eslint');
var minifyCSS = require('gulp-cssnano');
var prefix    = require('gulp-autoprefixer');
var debug     = require('gulp-debug');
var babel     = require('gulp-babel');
var del       = require('del');
var bSync     = require('browser-sync').create();
var nodemon   = require('gulp-nodemon');
var rjs       = require('gulp-requirejs');

gulp.task('tests', function() {
    return gulp.src("public/js/**/*.js", {ignore: "public/js/lib/**/*.js"})
       .pipe(eslint())
       .pipe(eslint.format())
       .pipe(eslint.failAfterError());
});

gulp.task('scripts', 
    gulp.series("tests", function scriptsInternal() {
        return gulp.src("public/js/**/*.js", {ignore: "public/js/lib/**/*.js"})
          .pipe(concat('bundle.min.js'))
          .pipe(babel({presets: ['env']}))
          .pipe(uglify())
          .pipe(gulp.dest("public/dist"));
    })
);

gulp.task('styles', function() {
    return gulp.src("public/css/**/*.css")
       .pipe(concat("bundle.css"))
       .pipe(minifyCSS())
       .pipe(prefix())
       .pipe(gulp.dest("public/dist"));
});

gulp.task('clean', function() {
    return del(["public/dist"])
});

gulp.task('nodemon', function(cb) {
    var started = false;
    return nodemon({
        script: 'bin/www'
    }).on('start', function nodemonStarted() {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('server', 
    gulp.series("nodemon", 
        function(done) {
            bSync.init({
                proxy: "localhost:3000",
                port: 7000,
                files: ["public/dist", "public/js"]
            });
            done();
        }
    )
);

gulp.task('default', 
    gulp.series("clean", 
        gulp.parallel("styles", "scripts"),
        "server",
        function defaultWatch(done) {
            gulp.watch("public/js/**/*.js", 
                {
                    ignore: "public/js/lib/**/*.js"
                },
                gulp.parallel("scripts")
            ); // js
            gulp.watch("public/css/**/*.css", 
                {
                    ignore: "public/css/lib/**/*.css"
                },
                gulp.parallel("styles")
            ); // js
            gulp.watch(["public/dist"], bSync.reload); // browsersync
            done();
        }
    )
);
