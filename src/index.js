import {starting} from './loader'

let defaultConfig = {
	tenant: {
		name: '',
		id: ''
	}
}

starting(window, defaultConfig, window.document.currentScript)