/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )( '<html><body><div id="container"></div></body></html>' );

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var DropZone = require( '../' );

describe( 'DropZone', function() {
	var container, sandbox;

	before( function() {
		DropZone.type.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
		container = document.getElementById( 'container' );
		window.MutationObserver = sinon.stub().returns( {
			observe: sinon.stub(),
			disconnect: sinon.stub()
		} );
	} );

	after( function() {
		delete window.MutationObserver;
		delete DropZone.type.prototype.__reactAutoBindMap.translate;
	} );

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function() {
		sandbox.restore();
		React.unmountComponentAtNode( container );
	} );

	it( 'should render as a child of its container by default', function() {
		var tree = React.render( React.createElement( DropZone ), container );

		expect( tree.refs.zone.getDOMNode().parentNode.id ).to.equal( 'container' );
	} );

	it( 'should accept a fullScreen prop to be rendered at the root', function() {
		var tree = React.render( React.createElement( DropZone, {
			fullScreen: true
		} ), container );

		expect( tree.refs.zone.getDOMNode().parentNode.id ).to.not.equal( 'container' );
		expect( tree.refs.zone.getDOMNode().parentNode.parentNode ).to.eql( document.body );
	} );

	it( 'should render default content if none is provided', function() {
		var tree = React.render( React.createElement( DropZone ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );
		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );
		expect( content.getDOMNode().textContent ).to.equal( 'Drop files to upload' );
	} );

	it( 'should accept children to override the default content', function() {
		var tree = React.render( React.createElement( DropZone, null, 'Hello World' ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		expect( content.getDOMNode().textContent ).to.equal( 'Hello World' );
	} );

	it( 'should accept an icon to override the default icon', function() {
		var tree = React.render( React.createElement( DropZone, {
			icon: 'hello-world'
		} ), container ), icon;

		icon = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );

		expect( icon.getDOMNode().className ).to.contain( 'hello-world' );
	} );

	it( 'should highlight the drop zone when dragging over the body', function() {
		var tree = React.render( React.createElement( DropZone ), container ),
			dragEnterEvent = new window.MouseEvent();

		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should start observing the body for mutations when dragging over', function( done ) {
		var tree = React.render( React.createElement( DropZone ), container ),
			dragEnterEvent = new window.MouseEvent();

		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		process.nextTick( function() {
			expect( tree.observer ).to.be.ok;
			done();
		} );
	} );

	it( 'should stop observing the body for mutations upon drag ending', function( done ) {
		var tree = React.render( React.createElement( DropZone ), container ),
			dragEnterEvent = new window.MouseEvent(),
			dragLeaveEvent = new window.MouseEvent();

		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		dragLeaveEvent.initMouseEvent( 'dragleave', true, true );
		window.dispatchEvent( dragLeaveEvent );

		process.nextTick( function() {
			expect( tree.observer ).to.be.undefined;
			done();
		} );
	} );

	it( 'should not highlight if onVerifyValidTransfer returns false', function() {
		var dragEnterEvent = new window.MouseEvent(),
			tree;

		tree = React.render( React.createElement( DropZone, {
			onVerifyValidTransfer: function() {
				return false;
			}
		} ), container );

		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.not.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the element', function() {
		var tree, dragEnterEvent;

		sandbox.stub( DropZone.type.prototype.__reactAutoBindMap, 'isWithinZoneBounds' ).returns( true );

		tree = React.render( React.createElement( DropZone ), container );

		dragEnterEvent = new window.MouseEvent();
		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the body if fullScreen', function() {
		var tree = React.render( React.createElement( DropZone, {
			fullScreen: true
		} ), container ), dragEnterEvent;

		dragEnterEvent = new window.MouseEvent();
		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should call onDrop with the raw event data when a drop occurs', function() {
		var tree, dropEvent,
			spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );

		tree = React.render( React.createElement( DropZone, {
			onDrop: spyDrop
		} ), container );

		dropEvent = new window.MouseEvent();
		dropEvent.initMouseEvent( 'drop', true, true );
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[0] ).to.eql( dropEvent );
	} );

	it( 'should call onFilesDrop with the files array when a drop occurs', function() {
		var tree, dropEvent,
			spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );
		tree = React.render( React.createElement( DropZone, {
			onFilesDrop: spyDrop
		} ), container );

		dropEvent = new window.MouseEvent();
		dropEvent.initMouseEvent( 'drop', true, true );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[0] ).to.eql( [ 1, 2, 3 ] );
	} );

	it( 'should not call onFilesDrop if onVerifyValidTransfer returns false', function() {
		var spyDrop = sandbox.spy(),
			dropEvent = new window.MouseEvent();

		React.render( React.createElement( DropZone, {
			onFilesDrop: spyDrop,
			onVerifyValidTransfer: function() {
				return false;
			}
		} ), container );

		dropEvent.initMouseEvent( 'drop', true, true );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.called ).to.not.be.ok;
	} );

	it( 'should allow more than one rendered DropZone on a page', function() {
		var tree = React.render(
			React.DOM.div(
				null,
				React.createElement( DropZone ),
				React.createElement( DropZone )
			),
			container
		), dragEnterEvent, rendered;

		rendered = TestUtils.scryRenderedComponentsWithType( tree, DropZone );

		dragEnterEvent = new window.MouseEvent();
		dragEnterEvent.initMouseEvent( 'dragenter', true, true );
		window.dispatchEvent( dragEnterEvent );

		expect( rendered ).to.have.length.of( 2 );
		rendered.forEach( function( zone ) {
			expect( zone.state.isDraggingOverDocument ).to.be.ok;
			expect( zone.state.isDraggingOverElement ).to.not.be.ok;
		} );
	} );
} );
