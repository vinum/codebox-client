#!/usr/bin/env node

/*
* CodeBoxes Client
* Aaron M. Shea
* codeboxes.github.io
*/

/**
 * Module dependencies.
 */

var program = require('commander');
var https = require('https');
var fs = require('fs');
var q = require('q');

// contants
var REPO_DB_URL = "https://raw.github.com/CodeBoxes/codeboxes-dbs/master/";
var REPO_LANG_URL = "https://raw.github.com/CodeBoxes/codeboxes-langs/master/";
var VAGRANT_CONFIG_URL = "https://gist.github.com/aaron524/7830108/raw/";
var PROVISION_URL = "https://gist.github.com/aaron524/7830204/raw/";

// useful functions
function makeDirectory(path)
{
	var deferred = q.defer();

	fs.mkdir(path,function(e){
		if(!e || (e && e.code === 'EEXIST')){
			deferred.resolve(null);
		} else {
			//debug
			deferred.resolve(e);
		}
	});

	return deferred.promise;
};

function _makeDirectory(path,cb)
{

	fs.mkdir(path,function(e){
		if(!e || (e && e.code === 'EEXIST')){
			cb(null);
		} else {
			//debug
			cb(e);
		}
	});
};

function downloadFile(url,path)
{

	var deferred = q.defer();

	var file = fs.createWriteStream(path);
	var request = https.get(url, function(response) {
		if(response.statusCode == 200)
		{
			response.pipe(file);
			deferred.resolve(response);
		}
		else
		{
			console.log("	== ERROR: Could not fetch file [" + url + "] ");
			console.log("	== Does this CodeBox not exist? Or is GitHub down? ");
			process.abort();
		}
	});

	return deferred.promise;

};

// command line client definition
program
  .version('1.0.0')
  .option('-d, --database [type]', 'Add the specified type of database [type]','')
  .option('-l, --lang [type]', 'Add the specified type of platform [type]','')
  .parse(process.argv);

// if the command got the correct  arguments
if(!program.database || !program.lang || program.lang == '' || program.database == '')
	// they did not provide all arguments
	console.log("Please tell me what kind of box you want! (--help for more info)");
else 
{
	console.log('	== Building a CodeBox with [' + program.lang + '] and [' + program.database + ']...');

	// let's build the box!

	// get the cwd
	var cwd = process.cwd();

	// make the containers diretory
	_makeDirectory(cwd + '/containers',function(e){
		if(e)
		{
			console.log("	!! Woops");
			console.log(e);
		}
		else
		{

			// start to download needed files
			console.log("	== Downloading Docker Files...");

			// promise chain to download db and lang container files

			/**
			* VERY UGLY LOOKING PROMISE CHAIN
			* THIS IS GOING TO BE REVISED. TRUST ME.
			**/

			// make lang directory
			makeDirectory(cwd + '/containers/lang-'+program.lang).then(function(e){
				// make db directory
				return makeDirectory(cwd + '/containers/db-'+program.database);
			}).then(function(e){
				// download lang Dockerfile
				return downloadFile(REPO_LANG_URL+program.lang+'/Dockerfile', cwd + '/containers/lang-'+program.lang+'/Dockerfile');
			}).then(function(resp){
				// download db Dockerfile
				return downloadFile(REPO_DB_URL+program.database+'/Dockerfile', cwd + '/containers/db-'+program.database+'/Dockerfile');
			}).then(function(resp){
				// download the db run.sh
				return downloadFile(REPO_DB_URL+program.database+'/run.sh', cwd + '/containers/db-'+program.database+'/run.sh');
			}).then(function(resp){
				// download the db start.sh
				return downloadFile(REPO_DB_URL+program.database+'/start.sh', cwd + '/containers/db-'+program.database+'/start.sh');				
			}).then(function(resp){
				// download the lang run.sh
				return downloadFile(REPO_LANG_URL+program.lang+'/run.sh', cwd + '/containers/lang-'+program.lang+'/run.sh');
			}).then(function(resp){
				// download the lang start.sh
				return downloadFile(REPO_LANG_URL+program.lang+'/start.sh', cwd + '/containers/lang-'+program.lang+'/start.sh');				
			}).then(function(resp){
				// download vagrantfile
				console.log("	== Finished Downloading Docker Files!\n");
				console.log("	== Downloading Vagrant Config...");
				return downloadFile(VAGRANT_CONFIG_URL, cwd + "/Vagrantfile");
			}).then(function(resp){
				// download the provision script
				console.log("	Done!\n");
				console.log("	== Downloading Provison Script...");
				return downloadFile(PROVISION_URL, cwd + "/provision.sh");
			}).then(function(resp){
				// all done!
				console.log("	Done!\n");
				console.log("CodeBox is ready for use! run 'vagrant up' to start developing!");
			});

		}
	});

};