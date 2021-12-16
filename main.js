fs = require('fs')
assert = require('assert')
colors = require('colors')
path = require('path')

var showdown  = require('showdown')
converter = new showdown.Converter()
converter.setFlavor('github')

var originalPath = "files/"
console.assert(fs.statSync(originalPath).isDirectory())

var articles = fs.readdirSync(originalPath)
articles = articles.filter(e => e.match(/\.(md)$/i) !== null)

articles.forEach(article => {
	fs.readFile(article, "utf8", function(error, data) {
		if (error) throw error
		var html = converter.makeHtml(data)
		var filenameWithoutExt = path.basename(article, ".md")
		fs.writeFile(originalPath+filenameWithoutExt+".html", html, function(err) {
			if (err) throw err
			console.log("Converted "+article+" to html.")
		}); 
	})
})

console.log("done")
