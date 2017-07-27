var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps');

// paths
var cssSrc = 'public/scss/*.scss',
    cssDest = 'public/css'
    jsSrc = 'public/js/src/*.js',
    jsDest = 'public/js';

// gulp 'default' task which runs watch before execution
gulp.task('default',['watch']);

// 'build-all' task for onetime build
gulp.task('build-all', ['build-css', 'build-js']);

//watch for changes in scss or js source files, and call build task
gulp.task('watch', function () {
    gulp.watch('public/scss/*.scss', ['build-css']);
    gulp.watch('public/js/src/*.js', ['build-js']);
});

//compile scss files, minify and write to output
gulp.task('build-css', function () {
    return gulp.src(cssSrc)
        .pipe(sourcemaps.init()) //Process the original sources
        .pipe(sass())            // convert scss to css
        .pipe(gulp.dest(cssDest))
        .pipe(rename('style.min.css'))
        .pipe(minify())
        .pipe(sourcemaps.write('.')) //Add the map to modified source.
        .pipe(gulp.dest(cssDest));
});

//conacat js files, minify and write to output
gulp.task('build-js', function () {
    return gulp.src(jsSrc)
        .pipe(sourcemaps.init()) //Process the original sources
        .pipe(concat('script.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('script.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.')) //Add the map to modified source.
        .pipe(gulp.dest(jsDest));
});
