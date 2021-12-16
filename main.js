fs = require('fs')
child_process = require('child_process')
assert = require('assert')
colors = require('colors')
path = require('path')

//console.log(require.main)

try {
	assert(false)
	console.error("Error: Assertions are not caught.".red)
	process.exit()
} catch(e) {
//	console.log(e)
	assert(e instanceof Error)
	assert(e.code === "ERR_ASSERTION")
}

assert(typeof (() => {}) === "function");
assert(Object.getPrototypeOf(() => {}) === Function.prototype)
assert((() => 5)() === 5)
assert((() => {})() === undefined)
assert(typeof (() => {return {}})() === "object")
assert(typeof (() => ({}))() === "object")
assert({} !== {})
assert((x => x).toString() === (x => x).toString())
assert((x => x) == "x => x")

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
