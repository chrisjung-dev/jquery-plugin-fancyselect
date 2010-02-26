/*!
 * jQuery.FancySelect()
 * 
 * @author Christian Jung <campino2k@gmail.com>
 * @license CC-BY-SA
 *
 * Date: Fr 26 Feb 2010 20:24:52 CET 
 */

(function($) {

	$.fn.FancySelect = function(options) {
		opts = $.extend({}, $.fn.FancySelect.defaults, options);
		return this.each(function(){
			$this = $(this);
			$this.wrap('<div class="select_replace" id="'+$this.attr('name')+'_dropdown"></div>').hide();
			$replace = $this.parents('.select_replace');
			$replace.append('<div class="display">'+$this.find('option:selected').text()+'</div>')
			$replace.click(function(){
				$.fn.FancySelect.openList($replace);
			});
		});
		
		
		//$(document).click(close);
	},

	
	$.fn.FancySelect.openList = function(_el){
		$this=$(_el);
		if( !$this.find('.options').length ) {
			$this.append('<div class="options"><ul></ul></div>');
		} else if( $this.find('div.options:hidden').length ) {
			$this.find('div.options').show();
		} else {
			$.fn.FancySelect.closeList();		
		}

	},
	
	
	$.fn.FancySelect.closeList = function(e){
		$('div.options:visible').hide();
	},
	
	// plugin defaults - added as a property on our plugin function
	$.fn.FancySelect.defaults = {
		borderColor: '#fd0000',
		color: '#0000fd'
	};

	// http://www.learningjquery.com/2007/10/a-plugin-development-pattern

})(jQuery);
