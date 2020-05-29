'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');//???
var sourcemap = require('gulp-sourcemaps');
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();

var js = require("gulp-uglify");
var pipeline = require('readable-stream').pipeline;

var csso = require('gulp-csso');
var rename = require('gulp-rename');
var svgstore = require('gulp-svgstore');
var del = require('del');

var pug = require('gulp-pug')
var pugLinter = require('gulp-pug-linter')
var htmlValidator = require('gulp-w3c-html-validator')
var bemValidator = require('gulp-html-bem-validator')

gulp.task('pug', function () {
  return gulp.src('src/pages/*.pug')
    .pipe(plumber())
    .pipe(pugLinter({ reporter: 'default' }))
    .pipe(pug({ pretty: true }))
    .pipe(htmlValidator())
    .pipe(bemValidator())
    .pipe(gulp.dest('build'))
})

gulp.task('css', function () {
  return gulp.src('src/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    // .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task("jsmin", function() {
  return pipeline(
    gulp.src('src/js/*.js'),
    js()
  )
  .pipe(rename("main.min.js"))
  .pipe(gulp.dest('build/js'))
});

gulp.task('sprite', function () {
  return gulp.src('src/img/icon-*.svg')
    .pipe(svgstore({inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
});


gulp.task('copy', function () {
  return gulp.src([
    'src/fonts/**/*.{woff,woff2}',
    'src/img/**',
    'src/js/**',
    'src/*.ico',
    'src/vendors/**'
  ], {
    base: 'src'
  })
  .pipe(gulp.dest('build'));
});


gulp.task('clean', function () {
  return del('build');
});


gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
  });

  gulp.watch('src/**/*.less', gulp.series('css'));
  gulp.watch("src/js/*.js", gulp.series("jsmin", "refresh"));
  gulp.watch('src/img/icon-*.svg', gulp.series('sprite', 'pug', 'refresh'));
  gulp.watch('src/**/*.pug', gulp.series('pug', 'refresh'));
});


gulp.task('build', gulp.series(
  'clean',
  'copy',
  'jsmin',
  'css',
  'sprite',
  'pug'
));

gulp.task('start', gulp.series('build', 'server'));
