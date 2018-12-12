
import opn from 'opn';
import { parse as urlParse } from 'url';
import {
    bookmarkActiveTabPage,
    navigateTo,
    newTab,
    setClientToMainBrowserWindow,
    delay
} from 'spectron-lib/browser-driver';
import {
    createAccountDetails,
    createAccount,
    login,
    logout
} from 'extensions/safe/test/e2e/lib/authenticator-drivers';
import { BROWSER_UI, WAIT_FOR_EXIST_TIMEOUT, DEFAULT_TIMEOUT_INTERVAL } from 'spectron-lib/constants';
import {
    setupSpectronApp
    , isCI
    , travisOS
    , afterAllTests
    , beforeAllTests
    , windowLoaded
} from 'spectron-lib/setupSpectronApp';

jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL + 420000;

const NOTIFICATION_WAIT = WAIT_FOR_EXIST_TIMEOUT + 40000;

console.warn( 'This test runs against a packaged version of the DEV browser. If not built, this will FAIL')
describe( 'SAFE network log in and out', async () =>
{
    const appInfo = {
        id     : 'net.peruse.test',
        name   : 'SAFE App Test',
        vendor : 'Peruse'
    };

    let app;

    beforeEach( async () =>
    {
        app = setupSpectronApp( ['--mock'] );

        await beforeAllTests( app );
    } );

    afterEach( async () =>
    {
        await afterAllTests( app );
    } );


    test( 'window loaded', async () =>
    {
        expect( await windowLoaded( app ) ).toBeTruthy();
    } );


    if ( travisOS === 'linux' )
    {
        // negate as xdg-open has problems with travis
        return;
    }

    describe( 'account data access', async ( ) =>
    {
        const { secret, password } = createAccountDetails();
        await delay( 10000 );
        console.log( 'Creating authed app with deets: ', secret, password );
        it( 'can save and reaccess browser bookmark data.', async ( ) =>
        {
            const { client } = app;

            expect.assertions( 2 );
            const bookmarkTab = await newTab( app );
            await navigateTo( app, 'shouldsavetobookmarks.com' );
            await delay( 2500 );
            await bookmarkActiveTabPage( app );

            await navigateTo( app, 'safe-browser:bookmarks' );
            await delay( 1500 );
            const bookmarksToSave = await client.getText( '.urlList__table' );

            // bookmarks is an array
            expect( bookmarksToSave ).toMatch( 'shouldsavetobookmarks' );

            await delay( 3500 );

            const authTab = await newTab( app );
            await navigateTo( app, 'safe-auth://home' );
            await delay( 1500 );

            // login
            await createAccount( app, secret, password, authTab );
            await delay( 9500 );


            await setClientToMainBrowserWindow( app );

            // click save.
            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_SAVE );

            await client.waitForExist( BROWSER_UI.NOTIFICATION__ACCEPT, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.NOTIFICATION__ACCEPT );
            await delay( 1500 );
            await logout( app, authTab );
            await delay( 1500 );

            await login( app, secret, password );
            await delay( 1500 );

            // WHY NOT LOGGED IN w second window?

            await setClientToMainBrowserWindow( app );

            console.log('THIS ONE WE GO**********************************')
            await navigateTo( app, 'safe-browser:bookmarks' );
            // fetch browser config
            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_LOAD );

            console.log('clicked loaaaaaaaddddddd')
            await client.waitForExist( BROWSER_UI.NOTIFICATION__ACCEPT, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.NOTIFICATION__ACCEPT );

            console.log('clicked loaaaaaaaddddddd and now waitinggggg')
            await delay( 8000 );
            // await delay( 1500 );
            const bookmarks = await client.getText( '.urlList__table' );
            // bookmarks is an array
            expect( bookmarks ).toMatch( 'shouldsavetobookmarks' );
            await delay( 1500 );
        } );

        it( 'should log in with a new account and NOT fetch anything', async () =>
        {
            const { client } = app;

            await delay( 3500 );

            await createAccount( app );

            await delay( 9500 );
            await setClientToMainBrowserWindow( app );
            await delay( 2500 );
            await client.waitForExist( BROWSER_UI.NOTIFICATION__ACCEPT, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.NOTIFICATION__ACCEPT );
            await delay( 1500 );

            // again the bookmarks
            // fetch browser config
            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_LOAD );
            await delay( 6000 );

            await navigateTo( app, 'safe-browser:bookmarks' );

            await delay( 1500 );
            const bookmarksFinalCheck = await client.getText( '.urlList__table' );

            // bookmarksFinalCheck is an array
            expect( bookmarksFinalCheck ).not.toMatch( 'shouldsavetobookmarks' );
        } );


        it( 'login with a new account cannot after logout of old, cannot access prev account data.', async () =>
        {
            const { client } = app;
            expect.assertions( 2 );

            await setClientToMainBrowserWindow( app );

            await delay( 1500 );

            await login( app, secret, password );
            await delay( 8500 );

            await setClientToMainBrowserWindow( app );

            await client.waitForExist( BROWSER_UI.NOTIFICATION__ACCEPT, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.NOTIFICATION__ACCEPT );

            // fetch browser config
            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_LOAD );
            await delay( 7000 );

            await navigateTo( app, 'safe-browser:bookmarks' );

            await delay( 1500 );
            const bookmarks = await client.getText( '.urlList__table' );

            // bookmarks is an array
            expect( bookmarks ).toMatch( 'shouldsavetobookmarks' );

            await logout( app );


            await delay( 6500 );

            await createAccount( app );
            await setClientToMainBrowserWindow( app );

            await client.waitForExist( BROWSER_UI.NOTIFICATION__ACCEPT, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.NOTIFICATION__ACCEPT );
            await delay( 1500 );


            // again the bookmarks
            // fetch browser config
            await client.waitForExist( BROWSER_UI.SPECTRON_AREA, NOTIFICATION_WAIT );
            await client.click( BROWSER_UI.SPECTRON_AREA__SPOOF_LOAD );
            await delay( 3000 );

            await navigateTo( app, 'safe-browser:bookmarks' );

            await delay( 2500 );
            const bookmarksFinalCheck = await client.getText( '.urlList__table' );

            // bookmarksFinalCheck is an array
            expect( bookmarksFinalCheck ).not.toMatch( 'shouldsavetobookmarks' );
        } );
    } );
} );
