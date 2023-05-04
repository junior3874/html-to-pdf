const { v1 } = require('uuid');
const puppetteer = require('puppeteer');
const querystryng = require('querystring');
const { join } = require('path');

const BASE_URL =
	'https://erickwendel.github.io/business-card-template/index.html';

function createQueryStringFromObject(data) {
	const separator = null;
	const keyDelimiter = null;
	const options = {
		encodeURIComponent: querystryng.unescape,
	};

	const qs = querystryng.stringify(data, separator, keyDelimiter, options);

	return qs;
}

async function render({ finalURI, name }) {
	const output = join(__dirname, `./../output/${name}-${v1()}.pdf`);

	const browser = await puppetteer.launch({
		headless: 'new',
	});

	const page = await browser.newPage();

	await page.goto(finalURI, { waitUntil: 'networkidle2' });

	await page.pdf({
		path: output,
		format: 'A4',
		landscape: true,
		printBackground: true,
	});

	await browser.close();
}

async function main(message) {
	const pid = process.pid;
	console.log(`${pid} got a message!`, message.name);
	const qs = createQueryStringFromObject(message);
	const finalURI = `${BASE_URL}?${qs}`;

	try {
		await render({ finalURI, name: message.name });
		process.send(`${pid} has finished`);
	} catch (err) {
		process.send(`${pid} has broken ${err.stack}`);
	}
}

process.once('message', main);
