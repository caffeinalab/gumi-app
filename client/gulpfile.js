var gulp = require('gulp');
var gulpIf = require('gulp-if');
var path = require('path');
var del = require('del');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var runSequence = require('run-sequence');

var injectPartials = require('gulp-inject-partials');

var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var sourcemaps  = require('gulp-sourcemaps');

var bro = require('gulp-bro');

var cacheBuster = require('gulp-cache-bust');
//concat
var useref = require('gulp-useref');
//css
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
// js
var uglify = require('gulp-uglify');

var watch = require('gulp-watch');

var url = require("url");
var fs = require("fs");
var browserSync = require('browser-sync').create();

var app  = './app';
var tmp = './tmp';
var dist = './public';
var folder = path.resolve(__dirname, dist);

var env = process.env.NODE_ENV || 'development';
var isDev = env !== 'production';

gulp.task('less', function() {
    return gulp.src(app+'/less/main.less')  // only compile the entry file
      .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
      .pipe(gulpIf(isDev, sourcemaps.init()))
      .pipe(less())
      .pipe(gulpIf(!isDev, cssnano()))
      .pipe(gulpIf(isDev, sourcemaps.write()))
      .pipe(gulp.dest(tmp+'/css'))
      .pipe(gulpIf(isDev, notify("LESS - Build successful!"), console.log("LESS - Build successful!") ));
});

gulp.task('babel', function () {
  return gulp.src(app+'/js/app.js')
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ['es2015'] }),
        ]
      })
    )
    .pipe(gulpIf(!isDev, uglify()))
    .pipe(gulp.dest(tmp+'/js'))
    .pipe(gulpIf(isDev, notify("JS - Build successful!"), console.log("JS - Build successful!") ));
});

gulp.task('useref', function(){
  return gulp.src(app+'/index.html')
    .pipe(injectPartials({
        removeTags: true,
        start: '<## {{path}}>',
        end: '</##>'
    }))
    .pipe(gulp.dest(tmp))
    .pipe(useref())
    .pipe(gulp.dest(tmp))
});



gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: tmp
    },
  })
});

gulp.task('cacheBuster', function () {
    return gulp.src(tmp+'/*.html')
        .pipe(cacheBuster({
            type: 'timestamp'
        }))
        .pipe(gulp.dest(tmp));
});

gulp.task('clean:tmp', function() {
  return del.sync(tmp);
})
gulp.task('clean:dist', function() {
  return del.sync(dist);
})

gulp.task('watch', function() {
    gulp.watch(app+'/less/**/*.less', ['watch:css']);
    gulp.watch(app+'/js/**/*.js', ['watch:js']);

    // Reloads the browser whenever HTML or JS files change
    gulp.watch(app+'/index.html', ['watch:html']); 
    gulp.watch(app+'/template/**/*.template', ['watch:html']); 
});

gulp.task('copy-static', function(){
  return gulp.src(app+'/static/**/*.*')
    .pipe(gulp.dest(tmp+'/static'))
});

gulp.task('copy-build:css', function(){
  return gulp.src(tmp+'/css/*.*')
    .pipe(gulp.dest(dist+'/css'))
    .pipe( (gulpIf(isDev,
        browserSync.reload({
          stream: true
        })
      ))
    )
});

gulp.task('copy-build:js', function(){
  return gulp.src(tmp+'/js/*.*')
    .pipe(gulp.dest(dist+'/js'))
});

gulp.task('copy-build:html', function(){
  return gulp.src(tmp+'/index.html')
    .pipe(gulp.dest(dist+''))
});


gulp.task('copy-build', function(){
  return gulp.src(tmp+'/**/*.*')
    .pipe(gulp.dest(dist))
});

gulp.task('watch:js', function(){
  runSequence( 'babel', 'copy-build:js', browserSync.reload );
});

gulp.task('watch:css', function(){
  runSequence( 'less', 'copy-build:css');
});

gulp.task('watch:html', function(){
  runSequence( 'useref', 'copy-build:html', browserSync.reload );
});

gulp.task('default', function(callback){
  runSequence('clean:tmp',
              'copy-static',
              ['less', 'babel'],
              'useref',
              'clean:dist',
              'copy-build',
              'watch',
              'browserSync',
              callback);
});

gulp.task('build', function(callback){
  runSequence('clean:tmp',
              'copy-static',
              ['less', 'babel'],
              'useref',
              'clean:dist',
              'cacheBuster',
              'copy-build',
              callback);
});