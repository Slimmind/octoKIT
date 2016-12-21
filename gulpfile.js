var args = process.argv.slice(2);
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var imageMin = require('gulp-imagemin');
var pngCrush = require('imagemin-pngcrush');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cmq = require('gulp-combine-mq');
var cssMin = require('gulp-cssmin');
var csscomb = require('gulp-csscomb');
var rigger = require('gulp-rigger');
var pages = '_*.html';
//gulp -p _home.html
var _p = args.indexOf('-p');
if (_p !== -1) {
  var pageName = args[_p + 1];
  if (pageName) {
    pages = pageName;
  }
}
var pagesWatch = [pages, 'templates/*.html'];

//HTML include

gulp.task('html', function () {
  gulp.src(pages)
    .pipe(rigger())
    .pipe(rename(function (path) {
      var newName = path.basename;
      if (newName.charAt(0) === '_')
        newName = newName.slice(1);
      path.basename = newName;
    }))
    .pipe(gulp.dest(''));
});

// Images, Fonts

gulp.task('images', function () {
  return gulp.src('assets/images/**')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('images-dev', function () {
  return gulp.src('assets/images/**')
    .pipe(imageMin({
      progressive: true,
      svgoPlugins: [
        {removeViewBox: false}
      ],
      use: [pngCrush()]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  gulp.src('assets/fonts/**')
    .pipe(gulp.dest('dist/fonts'));
});

// CSS

gulp.task('scss', function () {
	var processors = [
    autoprefixer({browsers: ['last 2 versions']})
  ];
  gulp.src(['assets/css/global.scss', 'assets/css/pages/*.scss'])
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(cmq({
    	beautify: true
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(csscomb())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scss-dev', function () {
		var processors = [
      autoprefixer({browsers: ['last 2 versions']})
    ];
  gulp.src(['assets/css/global.scss', 'assets/css/pages/*.scss'])
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(cmq({
    	beautify: true
    }))
    .pipe(postcss(processors)).pipe(gulp.dest('dist/css'))
    .pipe(csscomb())
    .pipe(cssMin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/css'));
});

// JS

gulp.task('jscs', function () {
  gulp.src(['assets/js/*.js'])
    .pipe(jscs());
});

gulp.task('lint', function () {
  gulp.src(['assets/js/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', ['jscs', 'lint'], function () {
  gulp.src(['assets/js/*.js'])
    .pipe(rigger())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-dev', ['jscs', 'lint'], function () {
  gulp.src(['assets/js/*.js'])
    .pipe(rigger())
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/js'));
});

// WATCH

gulp.task('watch', function () {
  gulp.watch('assets/js/**/*.js', ['js']);
  gulp.watch(pagesWatch, ['html']);
  gulp.watch('assets/css/**/*.scss', ['scss']);
});

// DEFAULT

gulp.task('default', ['html', 'images', 'fonts', 'scss', 'js', 'watch']);
gulp.task('dev', ['html', 'images-dev', 'fonts', 'scss-dev', 'js-dev', 'watch']);