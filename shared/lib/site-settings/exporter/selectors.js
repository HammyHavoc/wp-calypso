import { States } from './constants.js';

function mapOptions( state, section, name, mapFunc ) {
	const rawData = state.siteSettings.exporter.data.get( 'advancedSettings' );
	if ( !rawData || rawData.count() === 0 ) return [];

	return rawData.get( section ).get( name ).map( mapFunc );
}

export function getAuthorOptions( state, section ) {
	return mapOptions( state, section, 'authors', ( author ) => ( {
		key: author.get( 'ID' ), label: author.get( 'name' )
	} ) );
}

export function getStatusOptions( state, section ) {
	return mapOptions( state, section, 'statuses', ( status ) => ( {
		key: status.get( 'name' ), label: status.get( 'label' )
	} ) );
}

export function getDateOptions( state, section ) {
	const months = [ 'N/A', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

	return mapOptions( state, section, 'export_date_options', ( date ) => {
		if ( parseInt( date.get( 'month' ) ) === 0 || parseInt( date.get( 'year' ) ) === 0 ) {
			return {
				key: '0',
				label: 'Unknown'
			}
		}

		return {
			key: `${ date.get( 'month' ) } ${ date.get( 'year' ) }`,
			label: `${ months[ date.get( 'month' ) ] } ${ date.get( 'year' ) }`
		}
	} );
}

export function getCategoryOptions( state, section ) {
	return mapOptions( state, section, 'categories', ( category ) => ( {
		key: category.get( 'name' ), label: category.get( 'name' )
	} ) );
}

/**
 * Indicates whether an export can be started
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if an export can be started
 */
export function canStartExport( state ) {
	const exportingState = state.siteSettings.exporter.ui.get( 'exportingState' );

	return ( exportingState === States.READY ||
	         exportingState === States.COMPLETED ||
	         exportingState === States.FAILED );
}

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state ) {
	const exportingState = state.siteSettings.exporter.ui.get( 'exportingState' );

	return ( exportingState === States.STARTING ||
	         exportingState === States.EXPORTING );
}

export function isFailed( state ) {
	return state.siteSettings.exporter.ui.get( 'exportingState' ) === States.FAILED;
}

export function isComplete( state ) {
	return state.siteSettings.exporter.ui.get( 'exportingState' ) === States.COMPLETED;
}
