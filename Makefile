all: src/**/*
	rm -rf build
	mkdir build
	node_modules/.bin/rollup -g d3-array:d3,d3-collection:d3,d3-dispatch:d3,d3-quadtree:d3,d3-timer:d3 -f umd -n d3 -o build/d3-force.js -- index.js
