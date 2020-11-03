import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from 'vue'
import Chat from './components/chat.js'

import './quasar.js'
import { LocalStorage, date } from 'quasar'

import AWS from 'aws-sdk';
import awsconfig from './aws-exports';

const DEFAULT_NAME = '_hw';
const scriptElement = window.document.currentScript
const win = window

const instanceName = scriptElement?.attributes.getNamedItem('id')?.value ?? DEFAULT_NAME;
const origin = scriptElement?.attributes.getNamedItem('id').ownerDocument.location.origin
const loaderObject = win[instanceName];
const tenant = loaderObject.q[0][1].tenant

let defaultConfig = {
	tenant: {
		name: '',
		id: ''
	}
}
let widgetID = null
const location = window.location.origin

// zelfstaande packages dat niet is afhankelijk van andere packages 
// naam en API key, mantelzorg, vrijwilligers, algemene vragen.
AWS.config.region = awsconfig.aws_bots_config[0].region; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	// Provide your Pool Id here
	IdentityPoolId: awsconfig.aws_cognito_identity_pool_id,
});
let status = false
const lexruntime = new AWS.LexRuntime();
let lexUserId = null

const timeSendMessage = LocalStorage.getItem('time')
const currentTime = Date.now()
const unit = 'minutes'
const timeSession = 60

const diff = date.getDateDiff(currentTime, timeSendMessage, unit)


const ID = LocalStorage.getItem('ID') 

if (!ID) {
	lexUserId = `${awsconfig.aws_bots_config[0].region}:${awsconfig.aws_bots_config[0].key}-${Date.now()}`
} else {
	lexUserId = ID
}

function clearStorage() {
	LocalStorage.set('ID', '')
	LocalStorage.set('time', '')
	LocalStorage.set('options', '')
	LocalStorage.set('conversation', [])
	LocalStorage.set('session', '')
	
}

const params = {
	botAlias: awsconfig.aws_bots_config[0].alias,
	botName: awsconfig.aws_bots_config[0].name,
	inputText: 'hello',
	userId: lexUserId,
	sessionAttributes: {},
	requestAttributes: {
		parentOrigin: origin,
		tenantID: tenant.id,
		tenantName: tenant.name
	}
};

async function starting() {
	const tenantName = LocalStorage.getItem('tenantName')
	const tenantID = LocalStorage.getItem('tenantID')
	if(diff >= timeSession || tenantName !== tenant.name || tenantID !== tenant.id) {
		clearStorage()
		await lexruntime.postText(params, async (err, response) => {
			if (err) {
				status = false
				throw new Error(`Widget can not be loaded`);
			}
	
			if (response) {
				status = true
				await startWidget()
				LocalStorage.set('tenantName', tenant.name)
				LocalStorage.set('tenantID', tenant.id)
			}
		})
	} else {
		status = true
		await startWidget()
		LocalStorage.set('tenantName', tenant.name)
		LocalStorage.set('tenantID', tenant.id)
	}
}

starting()

async function startWidget() {
	// get a hold of script tag instance, which has an
	// attribute `id` with unique identifier of the widget instance
	if (!loaderObject || !loaderObject.q) {
		throw new Error(`Widget didn't find LoaderObject for instance [${instanceName}]. ` +
			`The loading script was either modified, no call to 'init' method was done ` +
			`or there is conflicting object defined in \`window.${instanceName}\` .`);
	}

	// check that the widget is not loaded twice under the same name
	if (win[`loaded-${instanceName}`]) {
		throw new Error(`Widget with name [${instanceName}] was already loaded. `
			+ `This means you have multiple instances with same identifier (e.g. '${DEFAULT_NAME}')`);
	}

	// iterate over all methods that were called up until now
	for (let i = 0; i < loaderObject.q.length; i++) {
		const item = loaderObject.q[i];
		const methodName = item[0];

		if (i === 0 && methodName !== 'init' && !status) {
			throw new Error(`Failed to start Widget [${instanceName}]. 'init' must be called before other methods.`);
		} else if (i !== 0 && methodName === 'init' && status) {
			continue;
		}

		switch (methodName) {
			case 'init':
				const loadedObject = Object.assign(defaultConfig, item[1]);

				// the actual rendering of the widget
				const wrappingElement = loadedObject.element ?? win.document.body;
				const targetElement = wrappingElement.appendChild(win.document.createElement('div'));
				targetElement.setAttribute('id', `widget-${instanceName}`);

				widgetID = `#widget-${instanceName}`
				document.body.appendChild(targetElement)
				win[`loaded-${instanceName}`] = true;

				break;
			// TODO: here you can handle additional async interactions
			// with the widget from page (e.q. `_hw('refreshStats')`)
			default:
				console.warn(`Unsupported method [${methodName}]`, item[1]);
		}
	}

	new Vue({
		el: widgetID,
		props: ['config'],
		render: (h) => h(Chat, { props: { origin: origin, tenant: tenant, location: location }})
	})
}
