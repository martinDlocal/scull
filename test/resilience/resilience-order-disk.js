'use strict';

const lab = exports.lab = require( 'lab' ).script();
const describe = lab.experiment;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const Setup = require( './setup' );
const Client = require( './setup/client' );

describe( 'resilience, no chaos, in memory', () => {
	const setup = Setup( { chaos: false, persist: true } );
	before( { timeout: 30000 }, setup.before );
	after( { timeout: 30000 }, setup.after );

	it( 'works', { timeout: 121000 }, done => {
		let timeout;
		const client = Client( setup.addresses, { duration: 120000 } );
		const emitter = client( done );
		resetOperationTimeout();
		emitter.on( 'operation', resetOperationTimeout );

		function onOperationTimeout() {
			console.log( 'stats: %j', emitter.stats );
			done( new Error( 'no operation for more than 11 seconds' ) );
		}

		function resetOperationTimeout() {
			if ( timeout ) {
				clearTimeout( timeout );
			}
			timeout = setTimeout( onOperationTimeout, 11000 );
		}
	} );
} );
