import {startWidget} from './loader'

import {DEFAULT_NAME, install, testConfig} from './common'

describe('loader default widget', () =>{
    it('should load single default instance', () => {
        const expectedName = DEFAULT_NAME;
       
        install(expectedName);

        startWidget(window, testConfig)

        // // assert
        expect(window[expectedName]).toBeDefined();
        expect(window['loaded-' + expectedName]).toBeDefined();
    })
})

