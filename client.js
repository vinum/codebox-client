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
var async = require('async');

// contants
var REPO_URL = "https://raw.github.com/CodeBoxes/box-repo/master/";
var VAGRANT_CONFIG_URL = "https://gist.github.com/aaron524/7830108/raw/";
var PROVISION_URL = "https://gist.github.com/aaron524/7830204/raw/";


function getBox(boxTitle,cb)
{
	_makeDirectory(cwd + '/containers/' + boxTitle).then(function(err){
		// download the Dockerfile
		if(!err)
		{
			// directory creation ok, start downloads
			console.log('	== Fetching Dockerfile for [' + boxTitle + ']');
			return downloadFile(REPO_URL + boxTitle +'/Dockerfile', cwd+'/containers/'+boxTitle+'/Dockerfile');
		}
		else
		{
			console.log("	== ERROR: could not make container directory!");
			process.abort();
		}
	}).then(function(resp){
		// download the start.sh script
		console.log('	== Fetching start.sh for [' + boxTitle + ']');
		return downloadFile(REPO_URL + boxTitle +'/start.sh', cwd+'/containers/' + boxTitle + '/start.sh');
	}).then(function(resp){
		// download run.sh
		console.log('	== Fetching run.sh for [' + boxTitle + ']');
		return downloadFile(REPO_URL + boxTitle +'/run.sh', cwd + '/containers/' + boxTitle + '/run.sh');
	}).then(function(){
		// download the README file
		console.log('	== Fetching README.md for [' + boxTitle + ']');
		return downloadFile(REPO_URL + boxTitle +'/README.md', cwd + '/containers/' + boxTitle + '/README.md');
	}).then(function(resp){
		console.log('\n\t ✓ Finished Fetching [' + boxTitle + ']\n');
		cb(null);
	});

};

/**
	_makeDirectory(path)
	Make a directory with the given path
	Uses promisses, will contain err is any error in creating directory
**/
function _makeDirectory(path)
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

/**
	makeDirectory(path,cb)
	Make a directory with the given path
	Uses callbacks
	Will pass err to callback if any error in creating directory
**/
function makeDirectory(path,cb)
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

/**
	downloadFile(url, path)
	Downloads file from 'url' and saves to given file 'path'
	Uses promisses
	Will contain the responce object and will kill process on fail
**/
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
			console.log("        == ERROR: Could not fetch file [" + url + "] ");
			console.log("        == Does this CodeBox not exist? Or is GitHub down? ");
			process.abort();
		}
	});

	return deferred.promise;

};


// command line client definition
program
	.version('1.3.0')
	.option('-b, --boxes [type]', 'Add the specified types of boxes to be downloaded [-b php,mysql]','')
	.parse(process.argv);

// if the command got the correct  arguments
if(!program.boxes || program.boxes == '')
	// they did not provide all arguments
	console.log("Please tell me what kind of boxes you want! (--help for more info)");
else 
{
	console.log('	== Building a CodeBox...');

	// let's fetch the boxes
	var boxes = program.boxes.split(',');

	// get the cwd
	var cwd = process.cwd();

	// make the containers diretory
	makeDirectory(cwd + '/containers',function(e){
		if(e)
		{
			console.log('	== Woops!');
			console.log('	== Error: ' + e);
		}
		else
		{
			async.each(boxes, getBox, function(err){
				// download the provison script and Vagrantfile
				downloadFile(PROVISION_URL,cwd+'/provision.sh').then(function(resp){
					return downloadFile(VAGRANT_CONFIG_URL,cwd+'/Vagrantfile');
				}).then(function(resp){
					console.log('	== Downloaded all files! You may now run "vagrant up" to start provisioning!');
				});
			});
		}
	});
};
