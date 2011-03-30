/*
 * jQuery.FancySelect()
 * 
 * @author Christian Jung <campino2k@gmail.com>
 * @license CC-BY-NC-SA
 *
 * Date: Fr 26 Feb 2010 20:24:52 CET 
 *
 * Tutorial for developing jQuery plugins
 * http://www.learningjquery.com/2007/10/a-plugin-development-pattern
 *
 */
var searchString='';

(function($) {
	$.fn.FancySelect = function(options) {
		opts = $.extend( {}, $.fn.FancySelect.defaults, options );
		return this.each( function(){
			// this cycles through all matched objects and attaches / runs all other functions
			var $this = $(this);
			$this.wrap('<div class="select_replace" id="'+$this.attr('name')+'_dropdown"></div>').hide();
			var $replace = $this.parents('.select_replace');
			$replace.append('<div class="display">'+$this.find('option:selected').text()+'</div>');
			$replace.click(function(){
				var openList = $( 'div.options:visible' );
				if( openList.length > 0 ) {
					$.fn.FancySelect.closeList($replace);
				} else {
					$.fn.FancySelect.openList($replace);
				}
			});
		});
	},
	$.fn.extend({
		setVal: function( _val ) {
			$(this).val( _val ).trigger('change');
				$(this).parents( '.select_replace' ).find('.display').text( $(this).find(':selected').text() );
		},
		update: function() {
			if( $(this).find('option:selected').length > 0 ) {
				$(this).parents( '.select_replace' ).find('.display').text( $(this).find('option:selected').text() );				
			} else {
				$(this).parents( '.select_replace' ).find('.display').text( $(this).find('option:first').text() );
			}
		}
	}),
	$.fn.FancySelect.openList = function( _el ){
		$.fn.FancySelect.closeList();
		var $this=$( _el ); // save element
		$this.css({zIndex:9999});
		var $select_elem = $this.find('select');
		var optgroups = $this.find('select optgroup');
        var n_optgroups = optgroups.length;
		var options	= $this.find('select option');
		var n_options = options.length; //save number of options
		var has_options = $this.find('.options').length; 
		if( n_options > 0 && has_options == 0 ) {
			//if optgroups only, loop is not needed, cause there is nothing clickable
			$this.append( '<div class="options"></div>' );
			var $list = $this.find('.options').empty();
			var i_optgroups;
			for( i_optgroups = 0; i_optgroups < n_optgroups; i_optgroups++ ) {
				$list.append('<div class="group"></div>');
				// need the last selector to get always the "newest" group to append the list items
				var $new_group = $list.find('div.group:last');
				if( $( optgroups[ i_optgroups ] ).attr('label') != "" ) {
					$new_group.append('<strong>' + $( optgroups[ i_optgroups ] ).attr('label') + '</strong>');
				}
				var o_options = $( optgroups[ i_optgroups ] ).find('option');
				var o_n_options = o_options.length;
				$.fn.FancySelect.renderOptions( o_options, o_n_options, $new_group );
			}
			if( n_optgroups == 0 ) {
				$.fn.FancySelect.renderOptions( options, n_options, $list );
			}
		} else if( $this.find('div.options:hidden').length ) {
			$this.find('div.options').show();
		} else {
			$.fn.FancySelect.closeList();
			return;		
		}
		var $options = $('div.options');
		$options.css({
			overflow: 'auto',
			height: ( $( _el ).find('li').outerHeight() ) * opts.maxEntries + "px"
		});
		$options.find( 'li' ).removeClass('entry_selected');
		$options_actual = $options.find( 'li[clickvalue="' + $select_elem.val() + '"]' );
		$options_actual.addClass( 'entry_selected' );
		var $elem = $options_actual;
		var $offsetTop = 0;
		while ( $elem.hasClass('options') == false ){
			$offsetTop = $offsetTop + $elem.position().top;
			$elem  = $elem.parent();
		};
		if( $offsetTop >= $options.outerHeight() ){
			$options.scrollTop( $offsetTop );
		}
		// append Listener on Document for keypressing
		$( document ).keydown(function( e ){
			$.fn.FancySelect.findEntryByKey( e );
		});
		$( 'body' ).click(function( event ) {
			if(
				$( event.target ).parents( 'div.select_replace' ).length == 0 && 
				!$( event.target ).hasClass( 'select_replace' ) &&
				$( 'div.options:visible' ).length > 0
			) {
				$.fn.FancySelect.closeList();
			}
		});
	},
	$.fn.FancySelect.renderOptions = function( _options, _n_options, _target ) {
		var i_options;
		$ul = $( '<ul/>' );
		for( i_options = 0; i_options < _n_options; i_options++ ) {
			var $li = $( '<li/>', {
				'clickvalue':	$( _options[ i_options ]).attr( 'value' ),
				text:		$( _options[ i_options ]).text(),
				mouseenter:	function() {
					var $this = $( this );
					$this.addClass( 'entry_hover' );
					// scroll to entry
					var topList = $this.parents( 'div.options' ).offset().top;
					var bottomList = topList + $this.parents( 'div.options' ).innerHeight();
					if( $this.offset().top + $this.outerHeight() > bottomList ){
						$( 'div.options:visible' ).scrollTop( $( 'div.options:visible' ).scrollTop() + $this.outerHeight() );
					}
					while( $this.offset().top < topList ){
					// since the top-scrolling with groups can be incorrect because
					// of the group headers, do a while operation here to be able
					// to execute this automatically more than once
						$( 'div.options:visible' ).scrollTop( $( 'div.options:visible' ).scrollTop() - $this.outerHeight() );
					}
				},
				mouseleave:	function(){ $( this ).removeClass( 'entry_hover' ); },
				click:		function( event ){ 
					$.fn.FancySelect.clickEntry( $( this ) );
					event.stopPropagation();
				}
			});
			$ul.append( $li );
		}
		$( _target ).append( $ul );
	},
	$.fn.FancySelect.clickEntry = function( el ){
		var $replace_elem = $( el ).parents( '.select_replace');
		$replace_elem.find('.display' ).text( $( el ).text() );
		$replace_elem.find('select').val( $( el ).attr('clickvalue') );
		$replace_elem.find('select').trigger('change'); // do this programmatically because setting the selected does not do this
		$.fn.FancySelect.closeList();
	},
	$.fn.FancySelect.closeList = function( e ){
		$( e ).add( 'div.select_replace' ).css({zIndex:0});
		if( opts.otfRendering ) {
			$( 'div.options:visible' ).remove();
		} else {
			$( 'div.options:visible' ).hide();
		}
		$( document ).unbind( 'keypress' );
		$( 'body' ).unbind( 'click' );
	},
	$.fn.FancySelect.findEntryByKey = function( ev ){
        // append via document listener via $.fn.FancySelect.openList()
		// unbind via $fn.FancySelect.closeList()
		// use this to find, mark and scroll to the entry
		var pressedKeyChar = "";
		var entry; // need this in several subroutines
		pressedKeyChar = ev.which;
        try {
			window.clearTimeout( clearString );
		} catch( e ) {};
		if( pressedKeyChar == 32 || pressedKeyChar >= 48 && pressedKeyChar <= 122 ){
			var chr = String.fromCharCode( pressedKeyChar );
			searchString += chr;
			clearString = window.setTimeout( 'searchString="";', opts.searchResetTime );
			entry = $( 'div.options:visible li' ).filter( function(){
				var find = new RegExp( '^'+searchString, 'i' );
				return find.test( $(this).text() );
			});
			entry.parents( 'ul' )
				.find( 'li' )
				.trigger( 'mouseleave' );
			entry.first().trigger( 'mouseenter' );
		}
		if( ev.keyCode == 38 || ev.keyCode == 40 ) {
			ev.preventDefault(); // disable scolling
			// select first an active triggered then select additionally
			// the selected use the first element (should be the hovered)
			$this = $( 'div.options:visible li.entry_hover' );
			if( $this.length == 0 ){
			   $this = $( 'div.options:visible li.entry_selected' );
			}
			if( ev.keyCode == 38 ) {
				$new = $this.prev();
				// check if a next or prev group is available
				if( $new.length == 0 ) {
					$new = $this.parents( 'div.group' ).prev().find( 'li' ).last();
				}
			} else {
				$new = $this.next();
				if( $new.length == 0 ) {
				// check if a next or prev group is available
					$new = $this.parents( 'div.group' ).next().find( 'li' ).first();
				}
			}
			if( $new.length > 0 ) {
				// dont wrap around on the first/last element
				$this.trigger( 'mouseleave' );
				$new.trigger( 'mouseenter' );
			} 
		} 
		if( pressedKeyChar == 13 ) {
			$( 'div.options:visible li.entry_hover' ).trigger( 'click' );
			// the following will fail if the entry_hover was
			// found and triggered since there is no visible options list after success
			// this is intentional
			$( 'div.options:visible li.entry_selected' ).trigger( 'click' );
		}	
	},
	// plugin defaults - added as a property on our plugin function
	$.fn.FancySelect.defaults = {
		maxEntries: '8',
		searchResetTime: 600, // timeout for clearing the search-string
		otfRendering: true
	};
})(jQuery);
