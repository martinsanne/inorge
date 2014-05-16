var gulp = require('gulp'),
	uncss = require('gulp-uncss'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	prefix = require('gulp-autoprefixer'),
	csso = require('gulp-csso'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
	livereload = require('gulp-livereload'),
	lr = require('tiny-lr'),
	server = lr();

var paths = {
	'styles' : 'src/scss/**/*.scss',
	'scripts' : [
		'src/js/plugins/*.js',
		'src/js/partials/*.js',
		'src/js/*.js'
	]
},
dist_directory = 'dist/';

gulp.task('sass', function() {

	return gulp.src( paths.styles )
		.pipe(sass({errLogToConsole: true}))
		.on('error', notify.onError(function(error) {
			return err.message;
		}))
		.pipe(prefix('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(dist_directory+'/css'))
		.pipe(rename('style.min.css'))
		.pipe(csso())
		.pipe(gulp.dest(dist_directory+'/css'))
		.pipe(livereload(server));

});

gulp.task('scripts', function() {

	return gulp.src( paths.scripts )
		.pipe(concat('main.js'))
		.pipe(gulp.dest(dist_directory+'/js'))
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(dist_directory+'/js'))
		.pipe(livereload(server));

});

// Watch Files For Changes
gulp.task('watch', function() {

	gulp.watch( paths.styles, ['sass']);
	gulp.watch( paths.scripts, ['scripts']);

	server.listen(35729, function(err) {
		if (err) {
			return console.log(err);
		}
	});

});


gulp.task('vendor-scripts', function() {
	gulp.src([
			'src/js/vendor/*.js',
			'!src/js/vendor/modernizr.min.js', 
			'!src/js/vendor/conditionizr.js',
			'!src/js/vendor/respond.min.js',
			'!src/js/vendor/jquery-1.10.1.min.js',
		])
		.pipe(uglify())
		.pipe(concat('vendor.min.js'))
		.pipe(gulp.dest(dist_directory+'/js'));
});

// Default Task
gulp.task('default', ['sass', 'scripts', 'watch']);



