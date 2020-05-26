
// Gulp
const { watch, series, parallel, src, dest } = require('gulp');

//Scripts requires
const babel = require('gulp-babel');
const minify = require('gulp-minify');
const stripDebug = require('gulp-strip-debug');
const order = require('gulp-order');

//Styles requires
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const stripCssComments = require('gulp-strip-css-comments');

sass.compiler = require('sass');

//Tools and others requires
const argv = require('minimist')(process.argv.slice(2));
const gulpif = require('gulp-if');
const del = require('del');
const log = require('fancy-log');
const colors = require('ansi-colors');
const concat = require('gulp-concat');

// Setup directories object
const dir = {
	input: 'src/',
	get inputScripts() { return this.input + 'scripts/'; },
	get inputStyles() { return this.input + 'scss/' },
	output: '',
	get outputScripts() { return this.output + 'js/'; },
	get outputStyles() { return this.output + 'css/' }
}

// Autoprefixer options
const optAutoprefixer = {
	remove: false,
	cascade: false,
	add: true,
	remove: true
}

function clean(cb) {

	if (argv.prod) {
		log(colors.dim.bgRed.black(`Cleaning contents of '${colors.bold.white(dir.output)}' folder...`));
		del(dir.output);
	}else{
		log(colors.dim.bgRed.black(`Cleaning content of '${colors.bold.white(dir.outputScripts)}' folders...`));
		del([`${dir.outputScripts}**.js`, `!${dir.outputScripts}vendor/**`], `!${dir.outputStyles}style.css`);
	}

	cb();
}

// Handle the scripts of the project
function scripts(cb) {

	log(colors.dim.bgBlue.black(`Compiling scripts to: '${colors.bold.white(dir.outputScripts)}' folder`));

	return src( dir.inputScripts + '**/*.js')
	.pipe(order([
		"scripts/**/!(app)*.js", //all other js files on folder but not the app.js
		"scripts/app.js" // this should be the the last file to be added so that you can initiate you modules on
	], { base: dir.input }))
	.pipe(babel({
		presets: ['@babel/preset-env']
	}))
	.pipe(concat('image-zoom.js'))
	.pipe(gulpif(argv.prod, stripDebug()))
	.pipe(gulpif(argv.prod,minify({
		preserveComments : 'some',
		ext:{
            src:'.js',
            min:'.min.js'
        }
	})))
	.pipe(dest(dir.outputScripts));
	cb();
}

function styles(cb) {

	log(colors.dim.bgBlue.black(`Compiling styles to: ${colors.bold.white(dir.outputStyles)} folder`));

	return src(dir.inputStyles + '**/*.scss')
	.pipe(gulpif(argv.prod, stripCssComments()))
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(autoprefixer(optAutoprefixer))
	.pipe(dest(dir.outputStyles));
	cb();
}

function main(cb) {
	// if prod flag is found, change the output folder to 'dist/'
	if (argv.prod) {
		dir.output = 'dist/';
		log(colors.dim.bgRed.black(`You running Gulp in production mode...`));
	}

	log(colors.dim.bgBlue.black(`Your current output is set to: '${dir.output}'`));
	cb();
}

function watcher(cb) {
	log(colors.dim.bgBlue.black(`Watching for changes on: '${colors.bold.white(dir.input)}' folder`));
	watch(dir.inputScripts + '**/*.js', scripts);
	watch(dir.inputStyles + '**/*.scss', styles);
	cb();
}

exports.default = series( main, parallel(styles, scripts));
exports.clean = series(clean, main, parallel(styles, scripts));
exports.justClean = series(main, clean);
exports.watch = series(clean, main, parallel(styles, scripts), watcher);
