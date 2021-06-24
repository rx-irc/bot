// Node Dependencies
const fs = require('fs');
const path = require('path');

const PATH_PROJECT = path.resolve(__dirname);
const PATH_DOC = path.join(PATH_PROJECT, 'doc');
const PATH_NODEMODULES = path.join(PATH_PROJECT, 'node_modules', '@rx-irc');

let files = [
	...fs.readdirSync(PATH_DOC)
		.filter(filename => filename !== 'index.md')
		.filter(filename => !filename.startsWith('.'))
		.filter(filename => path.extname(filename) === '.md')
		.map(filename => path.join(PATH_DOC, filename)),

	...fs.readdirSync(PATH_NODEMODULES)
		.filter(filename => filename.startsWith('bot-'))
		.map(filename => path.join(PATH_NODEMODULES, filename, 'doc'))
		.map(pathname => fs.readdirSync(pathname)
			.filter(filename => !filename.startsWith('.'))
			.filter(filename => path.extname(filename) === '.md')
			.map(filename => path.join(pathname, filename)))
		.reduce((nested, flat) => flat.concat(nested), []),
];

module.exports = {
	index: path.join(PATH_PROJECT, 'README.md'),
	package: path.join(PATH_PROJECT, 'package.json'),

	source: path.resolve(PATH_PROJECT, '..'),
	destination: path.join(PATH_PROJECT, 'docs'),
	includes: ['^bot(-\\w+)?/(app|lib)/.+\\.js$'],

	plugins: [
		{
			name: 'esdoc-node',
		},
		{
			name: 'esdoc-external-nodejs-plugin',
			option: { enable: true },
		},
		{
			name: 'esdoc-external-ecmascript-plugin',
			option: { enable: true },
		},
		{
			name: 'esdoc-ecmascript-proposal-plugin',
			option: { all: true }
		},
		{
			name: 'esdoc-accessor-plugin',
			option: {
				access: ['public'],
				autoPrivate: true,
			},
		},
		{
			name: 'esdoc-coverage-plugin',
			option: {
				kind: [
					'class', 'function', 'variable',
					'constructor', 'method', 'member',
					'get', 'set',
				],
				enable: true,
			},
		},
		{
			name: 'esdoc-integrate-manual-plugin',
			option: {
				index: path.join(PATH_DOC, 'index.md'),
				asset: path.join(PATH_DOC, 'assets'),

				files,

				globalIndex: true,
			},
		},
		{
			name: 'esdoc-brand-plugin',
			option: {
				logo: path.join(PATH_DOC, 'assets', 'logo.png'),
				logoDimensions: { width: '20px', height: '20px' },
			},
		},
		{
			name: 'esdoc-publish-html-plugin',
		},
	],
};
