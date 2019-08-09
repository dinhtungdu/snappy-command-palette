import fuzzy from 'fuzzy';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

class CommandPalette {
	constructor() {
		this.cacheVariables();
		this.registerEvents();
		this.registerKeyboardShortcut();
	}

	cacheVariables() {
		this.wrapper = document.getElementById( 'command-palette-wrapper' );
		this.dialog = document.getElementById( 'command-palette-dialog' );
		this.dialogClose = document.getElementById( 'command-palette-dialog-close' );
		this.searchInput = document.getElementById( 'command-palette-search-input' );
		this.itemsContainer = document.getElementById( 'command-palette-items' );
		this.selectedItem = false;
	}

	registerEvents() {
		this.dialogClose.addEventListener( 'click', this.hideWrapper.bind( this ) );
		this.searchInput.addEventListener(
			'change',
			this.debounce( this.filterItems, 100 ).bind( this )
		);
		this.searchInput.addEventListener(
			'blur',
			this.debounce( this.focusInput, 10 ).bind( this )
		);
		this.itemsContainer.addEventListener(
			'mouseover',
			this.debounce( event => {
				if ( event.target && event.target.matches( 'a.item' ) ) {
this.selectItem( event.target );
}
			}, 10 )
		);
	}

	registerKeyboardShortcut() {
		Mousetrap.bind( 'shift shift', () => {
			this.filterItems();
			this.showWrapper();
			this.focusInput();
		} );

		Mousetrap( this.wrapper )
			.bind( 'enter', () => {
				this.followSelectedItem();
			} )
			.bind( 'down', () => {
				this.goToNextItem();
			} )
			.bind( 'up', () => {
				this.goToPreviousItem();
			} );

		Mousetrap.bindGlobal( 'esc', this.hideWrapper.bind( this ) );
	}

	showWrapper() {
		this.wrapper.style.display = 'block';
		document.addEventListener( 'click', this.handleOutsideClick.bind( this ) );
	}

	hideWrapper() {
		this.wrapper.style.display = 'none';
		document.removeEventListener( 'click', this.handleOutsideClick.bind( this ) );
	}

	focusInput() {
		this.searchInput.focus();
	}

	clearInput() {
		this.searchInput.value = '';
	}

	handleOutsideClick( event ) {
		if (
			this.dialog.contains( event.target ) ||
			'none' == this.wrapper.style.display
		) {
			return;
		}

		this.hideWrapper();
	}

	filterItems() {
		var options = {
			extract: function( el ) {
				return el.title;
			}
		};

		this.itemsContainer.innerHTML = '';

		fuzzy.filter( this.searchInput.value, CPItems, options ).map( el => {
			this.itemsContainer.innerHTML += `<a href="${el.original.url}" class="item" data-category="${el.original.category}" data-type="${el.original.type}">${el.string}</a>`;
		} );

		this.selectItem( this.itemsContainer.firstChild );
	}

	selectItem( element ) {
		if ( ! element ) {
			return;
		}
		if ( this.isElement( this.selectedItem ) ) {
			this.selectedItem.classList.remove( 'selected' );
		}
		this.selectedItem = element;
		this.selectedItem.classList.add( 'selected' );
	}

	followSelectedItem() {
		this.selectedItem.click();
	}

	goToNextItem() {
		this.selectItem( this.selectedItem.nextElementSibling );
	}

	goToPreviousItem() {
		this.selectItem( this.selectedItem.previousElementSibling );
	}

	debounce( func, wait, immediate ) {
		var timeout;
		return function() {
			var context = this,
				args = arguments;
			var later = function() {
				timeout = null;
				if ( ! immediate ) {
					func.apply( context, args );
				}
			};
			var callNow = immediate && ! timeout;
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
			if ( callNow ) {
				func.apply( context, args );
			}
		};
	}

	isElement( element ) {
		return element instanceof Element || element instanceof HTMLDocument;
	}
}

new CommandPalette();
