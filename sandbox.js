assert = require('assert')
colors = require('colors')
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

console.log("sandbox done".green)
