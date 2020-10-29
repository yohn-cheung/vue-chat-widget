export const DEFAULT_NAME = '_hw';

export const testConfig = {
    tenant: { name: '', id: ''}
}

export const install = (name) => {
    const w = window;
    // tslint:disable-next-line: only-arrow-functions
    w[name] = w[name] || function() { (w[name].q = w[name].q || []).push(arguments); };
    w[name]('init', {tenant: {name: 'developer', id: '2021'}});
};
