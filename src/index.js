import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from 'vue'
import Chat from './components/chat.js'
import './quasar.js'

const DEFAULT_NAME = '_hw';
const scriptElement = window.document.currentScript
const win = window

const instanceName = scriptElement?.attributes.getNamedItem('id')?.value ?? DEFAULT_NAME;
const loaderObject= win[instanceName];

// This can be changed later
let defaultConfig = {
    debug: false,
    tenant: {
        name: '',
        id: ''
    },
    text: {
        title: null
    }
}
let widgetID = null

// zelfstaande packages dat niet is afhankelijk van andere packages 
// naam en API key, mantelzorg, vrijwilligers, algemene vragen. 

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

    if (i === 0 && methodName !== 'init') {
        throw new Error(`Failed to start Widget [${instanceName}]. 'init' must be called before other methods.`);
    } else if (i !== 0 && methodName === 'init') {
        continue;
    }

    switch (methodName) {
        case 'init':
            const loadedObject = Object.assign(defaultConfig, item[1]);
            // console.log('loadedObject: ', loadedObject)
            // console.log(`Starting widget [${instanceName}]`, loadedObject); 

            // if (loadedObject.debug) {
            //     console.log(`Starting widget [${instanceName}]`, loadedObject); 
            // }

            // the actual rendering of the widget
            const wrappingElement = loadedObject.element ?? win.document.body;
            const targetElement = wrappingElement.appendChild(win.document.createElement('div'));
            targetElement.setAttribute('id', `widget-${instanceName}`);

            widgetID = `#widget-${instanceName}`

            // console.log('widgetID: ', widgetID)
            

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
    render: (h) => h(Chat, {props:{ config: defaultConfig}})
})
