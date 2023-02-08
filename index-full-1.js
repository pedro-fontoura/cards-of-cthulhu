//** File: app.js

"use strict;"

//** ===========================================================================

const A0 = {
	viewport: null,
	viewport_width: 0,
	pages_container: null,
	nr_pages: 0,
	lst_pages: null,
	current_page_idx: 0,
	previous_page_idx: 0,
	client_onResize: null,
	client_onClick: null,
	mouse_or_touch: null,
	PAGE_FREE: 0,
	PAGE_LANDSCAPE: 1,
	PAGE_PORTRAIT: -1,
	page_before_rotate: -1,
	page_mode: 0,
	page_rotate_id: 0,
	error_node: null,
	error_page: null
};

A0.Init = function ( onResize, onClick ) {
	
	this.viewport = document.getElementById( "AppViewport" );
	this.pages_container = document.getElementById( "AppPagesContainer" );
	this.lst_pages = Array.from( document.querySelectorAll( ".AppPage" ) );
	this.nr_pages = this.lst_pages.length;
	
	
	if ( window.hasOwnProperty( "cordova" ) ) {
		this.mouse_or_touch = "mousedown";
	} else {
		this.mouse_or_touch = (
			window.ontouchstart !== undefined
			? "touchstart"
			: "mousedown"
		);
	}
	
	A0.onResize( null );
	
	this.client_onResize = onResize || null;
	this.client_onClick = onClick || null;
	
	window.visualViewport.addEventListener( "resize", A0.onResize.bind( this ) );
};

A0.onResize = function ( evt ) {
	// 
	
	this.viewport_width = this.viewport.offsetWidth;
	this.viewport.style.height = window.visualViewport.height + "px";
	
	this.pages_container.style.width = ( this.nr_pages * this.viewport_width ) + "px";
	
	this.pages_container.style.left = (
		- this.current_page_idx * this.viewport.offsetWidth
	) + "px";
	
	this.lst_pages.forEach(
		page => page.style.width = this.viewport_width + "px"
	);

	this.ShowCurrentPage();
	this.TestPageMode();
	
	if ( this.client_onResize !== null ) {
		this.client_onResize( this.viewport_width, this.viewport.offsetHeight );
	}
};

A0.GetWidth = function () {
	return this.viewport_width;
};

A0.GetHeight = function () {
	return this.viewport.offsetHeight;
};

A0.ShowPage = function ( n = "" ) {
	// 
	
	if ( typeof n === "string" ) {
		var idx = 0, pg_id = n;
		n = this.current_page_idx;
		while ( idx < this.nr_pages ) {
			if ( this.lst_pages[ idx ].id === pg_id ) {
				n = idx;
				break;
			}
			idx ++;
		}
	}
	
	this.pages_container.style.left = ( - n * this.viewport.offsetWidth ) + "px";

	this.previous_page_idx = this.current_page_idx;
	this.current_page_idx = n;

	return n;
};

A0.GetCurrentPage = function () {
	return this.current_page_idx;
};

A0.GetCurrentPageId = function () {
	return this.lst_pages[ this.current_page_idx ].id;
};

A0.ShowCurrentPage = function () {
	this.ShowPage( this.current_page_idx );
};

A0.ShowPreviousPage = function () {
	this.ShowPage( this.current_page_idx );
};

A0.SetPageMode = function ( page_mode, page_rotate_id ) {
	this.page_mode = page_mode;
	this.page_rotate_id = page_rotate_id;
	this.TestPageMode();
};

A0.TestPageMode = function () {
	this.show_page = false;

	if ( this.page_mode !== this.PAGE_FREE ) {
		const status = Math.sign(
			this.viewport.offsetWidth - this.viewport.offsetHeight
		);
		if ( status !== this.page_mode ) {
			if ( this.page_before_rotate === -1 ) {
				this.page_before_rotate = this.current_page_idx;
			}
			this.ShowPage( this.page_rotate_id );
			this.show_page = true;
		} else {
			if ( this.page_before_rotate !== -1 ) {
				this.ShowPage( this.page_before_rotate );
				this.page_before_rotate = -1;
				this.show_page = true;
			}
		}
	}

	if ( ! this.show_page ) {
		this.ShowCurrentPage();
	}

	return this.show_page;
};

//** ===========================================================================

A0.AddClickEventListener = function ( evt_target, js_entity ) {
	evt_target.addEventListener( 
		this.mouse_or_touch,
		this.onClick.bind( this, js_entity )
	);
	
	evt_target.addEventListener(
		"contextmenu",
		this.onContextMenu.bind( this )
	);
};

A0.AddEventListener = function ( element, event_name, handler ) {
	if ( event_name === "MOUSE||TOUCH" ) {
		event_name = this.mouse_or_touch;
	}
	
	if ( event_name === "mousedown" ) {
		element.addEventListener( "contextmenu", this.onContextMenu.bind( this ) );
	}

	element.addEventListener( event_name, handler );
};

A0.ConsumeEvent = function ( evt ) {
	evt.stopPropagation();
	evt.preventDefault();
	return evt.target;
}

A0.onClick = function ( js_entity, evt ) {
	// 
	this.ConsumeEvent( evt );
	if ( this.client_onClick !== null ) {
		this.client_onClick( js_entity, evt.target );
	}
};

A0.onContextMenu = function ( evt ) {
	//  
	this.ConsumeEvent( evt );
	evt.target.click();
};

//** ===========================================================================

A0.RegisterServiceWorker = function ( sw_file ) {
	if (
		"serviceWorker" in navigator
		&& window.location.protocol === "https:"
		&& window.cordova === undefined
	) {
		if ( this.A1 && ! this.A1.Touch() ) {
			return;
		}
		navigator.serviceWorker.register( sw_file )
		.then(
			( reg ) => {
				
			}
		).catch(
			( error ) => {
				
			}
		);
	};
};

//** ===========================================================================

A0.SetErrorHandlers = function ( node = "AppError" ) {
	if ( typeof node === "string" ) {
		node = document.getElementById( node );
	}

	this.error_node = node;
	this.error_page = GetParentNodeByTag( node, "section" );
	
	//** Unhandled promise rejections
	window.addEventListener(
		"unhandledrejection",
		( evt ) => {
			evt.preventDefault();
			this.ShowError( "Unhandled rejection", evt.reason );
			
		}
	);
		
	//** Errors
	window.addEventListener(
		"error",
		 evt => {
			evt.preventDefault();
			const str = [
				evt.error.message,
				evt.error.fileName,
				evt.error.lineNumber,
				this.ProcessStackTrace( evt.error )
			].join( "<br>" );
			this.ShowError( "Error", str );
			
		 }
	);
};

A0.ProcessStackTrace = function ( error ) {
	return error.stack.split( "at " ).join( "<br>&bull; " );
};

A0.ShowError = function ( title, txt ) {
	this.error_node.innerHTML += "<h3>" + title + "</h3>" + txt;
	if ( this.error_page !== null ) {
		this.ShowPage( this.error_page.id );
	}
};

//** ===========================================================================
//** EOF//** File: c_FlexBoxEntity.js

"use strict;"

class FlexBoxEntity {
	
	#id = null;
	#top = Infinity;
	#left = Infinity;
	#width = Infinity;
	#height = Infinity;
	#element = null;

	constructor ( id, make_element = false ) {
		this.#id = id;
		
		if ( make_element === true ) {
			this.#element = this.#MakeElement();
		} else if ( make_element instanceof Node ) {
			this.#element = make_element;
			this.#element.id = this.#id;
			this.#element.classList.add( "FlexBoxEntity" );
		}
	}

	#MakeElement () {
		const element = document.createElement( "div" );
		element.id = this.#id;
		element.classList.add( "FlexBoxEntity" );

		return element;
	}

	GetId () {
		return this.#id;
	}

	GetPosition () {
		return [ this.#top, this.#left ];
	}

	GetElement () {
		return this.#element;
	}

	GetWidth () {
		return this.#width;
	}
	
	GetHeight () {
		return this.#height;
	}
	
	GetTop () {
		return this.#top;
	}
	
	GetLeft () {
		return this.#left;
	}
	
	onResize ( width, height, top, left ) {
		this.SetPosition( top, left );
		this.SetSize( width, height );
	}
	
	SetPosition ( top, left ) {
		this.#top = top;
		this.#left = left;
		
		if ( this.#element !== null ) {
			this.#element.style.top = top + "px";
			this.#element.style.left = left + "px";
		}
	}
	
	SetSize ( width, height ) {
		this.#width = width;
		this.#height = height;

		if ( this.#element !== null ) {
			this.#element.style.width = width + "px";
			this.#element.style.height = height + "px";
		}
	}
}

//** EOF//** File: c_FlexBox.js

"use strict;"

class FlexBox extends FlexBoxEntity {

	#orientation = null;
	#justify = null;
	#align = null;
	#lst_entities = [];
	#fn_sort_entities = null;
	
	constructor ( id, orientation, justify, align, make_element = false ) {
		super( id, make_element );

		this.#orientation = orientation;
		this.#justify = justify;
		this.#align = align;

		if ( make_element ) {
			this.GetElement().classList.add( "FlexBox" );
		}

	}

	AddEntity ( entity, to_end = true ) {
		this.#lst_entities[ to_end ? "push" : "unshift" ]( entity );
		if ( this.#fn_sort_entities !== null ) {
			this.#lst_entities.sort( this.#fn_sort_entities );
		}
		this.SetEntitiesPosition();
	}
	
	RemoveEntity ( entity ) {
		RemoveArrayElement( this.#lst_entities, entity );
		this.SetEntitiesPosition();
	}

	onResize ( width, height, top, left ) {
		super.onResize( width, height, top, left );
		this.SetEntitiesPosition();
	}

	SetEntitiesSize ( width, height ) {
		if ( this.#lst_entities.length > 0 ) {
			this.#lst_entities.forEach(
				e => e.SetSize( width, height )
			);
		}
	}

	SetEntitiesPosition () {
		if ( this.#lst_entities.length === 0 ) {
			return;
		}

		var entities_width = 0, entities_height = 0;

		this.#lst_entities.forEach(
			e => {
				entities_width += e.GetWidth();
				entities_height += e.GetHeight();
			}
		);

		if ( entities_width === Infinity || entities_height === Infinity ) {
			return;
		}

		var lst_left, lst_top;
		
		if ( this.#orientation === "row" ) {
			lst_left = this.#GetDistributionFunction( this.#justify )( true, "width", entities_width );
			lst_top = this.#GetDistributionFunction( this.#align )( false, "height", entities_height );
		} else {
			lst_top = this.#GetDistributionFunction( this.#justify )( true, "height", entities_height );
			lst_left = this.#GetDistributionFunction( this.#align )( false, "width", entities_width );
		}

		this.#lst_entities.forEach(
			e => {
				e.SetPosition( lst_top.shift(), lst_left.shift() );
			}
		);
	}

	ForEachEntity ( fn ) {
		this.#lst_entities.forEach( e => fn( e ) );
	}

	#GetDistributionFunction ( label ) {
		if ( label === "center" ) {
			return this.#MakeDistributionList_center.bind( this );
		} else if ( label === "start" ) {
			return this.#MakeDistributionList_start.bind( this );
		} else if ( label === "end" ) {
			return this.#MakeDistributionList_end.bind( this );
		} else if ( label === "evenly" ) {
			return this.#MakeDistributionList_evenly.bind( this );
		}
	}

	#PrepareDistribuitonList ( axis, key ) {
		var position = ( key === "width" ? this.GetLeft() : this.GetTop() );
		var idx, e;
		const lst = [];

		for ( idx = 0; idx < this.#lst_entities.length; ++ idx ) {
			if ( axis ) {
				if ( idx > 0 ) {
					e = this.#lst_entities[ idx - 1 ];
					position += ( key === "width" ? e.GetWidth() : e.GetHeight() );
				}
			}
			lst.push( position );
		}

		return lst;
	}

	#MakeDistributionList_start ( axis, key, entities_size ) {
		return this.#PrepareDistribuitonList( axis, key );
	}

	#MakeDistributionList_center ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( ( THIS_KEY - entities_size ) / 2 );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#lst_entities[ idx ];
				lst[ idx ] += Math.round(
					(
						THIS_KEY
						- 
						( key === "width" ? e.GetWidth() : e.GetHeight() )
					) / 2
				);
			}
		}
				
		return lst;
	}

	#MakeDistributionList_end ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( THIS_KEY - entities_size );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#lst_entities[ idx ];
				lst[ idx ] += THIS_KEY - ( key === "width" ? e.GetWidth() : e.GetHeight() );
			}
		}

		return lst;
	}
	
	#MakeDistributionList_evenly ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( ( THIS_KEY - entities_size ) / ( LEN + 1 ) );
	
		for ( var idx = 0; idx < LEN; ++ idx ) {
			lst[ idx ] += ( idx + 1 ) * step;
		}

		return lst;
	}

	SetSortEntities ( fn ) {
		this.#fn_sort_entities = fn;
	}

	// SortEntities ( fn ) {
	// 	this.#lst_entities.sort( fn );
	// 	this.SetEntitiesPosition();
	// }

	SetJustify ( justify ) {
		this.#justify = justify;
	}
}

//** EOF
A0.A1 = {
};

A0.A1.Touch = function () {
	return navigator.maxTouchPoints > 0;
};

A0.A1.iOS = function () {
	//** Note: navigator.platform is DEPRECATED
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes( navigator.platform )
	// iPad on iOS 13 detection
	|| ( navigator.userAgent.includes( "Mac" ) && "ontouchend" in document );
};

A0.A1.RequestFullscreen = function () {
	//** Note: requestFullscreen() fails on iOS
	if ( ! document.fullscreenElement && this.Touch() && ! this.iOS() ) {
		if ( document.documentElement.requestFullscreen instanceof Function ) {
			document.documentElement.requestFullscreen( { navigationUI: "hide" } );
		}
	}
};
//** File: tools.js

"use strict;"

function eById ( id_name ) {
	return document.getElementById(id_name);
};

function eByTag ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name)[0];
};

function aByTag ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name);
};

function eByClass (class_name, parent=document) {
	return parent.querySelector(class_name);
};

function aByClass ( class_name, parent=document) {
	return parent.querySelectorAll(class_name);
};

function GetParentNodeByTag ( node, tag ) {
	tag = tag.toUpperCase();
	while ( node !== null && node.tagName !== tag ) {
		node = node.parentNode;
	}
	return node;
};

function Delay ( ms, data = null ) {
	return new Promise(
		( resolve, _ ) => setTimeout( resolve, ms, data )
	);
};

function AppendChildren ( element, lst_children ) {
	lst_children.forEach(
		e => e !== null && element.appendChild( e )
	);
}



function QuerySeachString( query_key, default_value = null, to_int = false ) {
	var query_value = new URL( window.location ).searchParams.get( query_key );
	
	if ( query_value === null ) {
		query_value = default_value;
	} else if ( to_int ) {
		query_value = parseInt( query_value, 10 );
	}
	
	return query_value;
};

function GetVarCSS ( var_name, as_int ) {
	const VALUE = getComputedStyle( document.documentElement )
    	.getPropertyValue( "--" + var_name.split( "--" ).pop() )
		.trim();
	return ( as_int ? parseInt( VALUE, 10 ) : VALUE );
};

/**
 * MATH
 */

Math.randomInt = function ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

// Math.GOLDEN_RATIO = ( 1 + Math.sqrt( 5 ) ) / 2;

// Math.HALF_PI = Math.PI / 2;
// Math.TWO_PI = Math.PI * 2;

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function ShuffleArray ( array ) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
	}
}

function CloneArray ( array ) {
	// return array.slice( 0 );
	return array.concat();
}

function RemoveArrayElement ( array, element ) {
	if ( ! array.includes( element ) ) {
		return null;
	}
	return array.splice( array.indexOf( element), 1 ).pop();
}

function RemoveArrayIndex ( array, idx ) {
	if ( idx >= array.length ) {
		return null;
	}
	return array.splice( idx, 1 ).pop();
}

function RemoveRandomElement ( array ) {
	return RemoveArrayIndex( array, Math.randomInt( 0, array.length - 1 ) );
}

function GetRandomElement ( array ) {
	return array[ Math.randomInt( 0, array.length - 1 ) ];
}

//** EOF"use strict;"

class Prism {
    #nr_faces = 0;
    #width = 0;
    #height = 0;
    #is_horizontal = true;

    #rx = 0;
    #ry = 0;
    #rz = 0;
    #front_idx = 0;
    #angle = 0;
    #apothem = 0;

    #container_3d = null;
    #faces_wrapper = null;
    #lst_faces = [];

    constructor ( nr_faces, width, height, horizontal = true ) {
        this.#nr_faces = nr_faces;
        this.#width = width;
        this.#height = height;
        this.#is_horizontal = horizontal;

        this.#angle = 360 / this.#nr_faces;

        this.#MakeElements();
        this.#PlaceFaces();
        this.#AddToFrontIdx( 0 );
        this.#ApplyTransform();
    }

    #MakeElements () {
        //== 3D Container
        this.#container_3d = document.createElement( "div" );
        this.#container_3d.classList.add( "Prism" );
        this.#container_3d.style.width = this.#width + "px";
        this.#container_3d.style.height = this.#height + "px";
        
        //== Faces wrapper
        this.#faces_wrapper = document.createElement( "div" )
        this.#faces_wrapper.classList.add( "PrismWrapper" );
        
        this.#container_3d.appendChild( this.#faces_wrapper );

        //== Faces
        for ( var idx = 0, face; idx < this.#nr_faces; ++ idx ) {
            face = document.createElement( "div" );
            face.classList.add( "PrismFace" );
            face.dataset.idx = idx;
            // face.id = "PrismFace_" + idx;
            this.#lst_faces.push( face );
            this.#faces_wrapper.appendChild( face );
            face.innerHTML = idx;
        }
    }

    #PlaceFaces () {
        const d = ( this.#is_horizontal ? this.#width : this.#height );
        const axis = ( this.#is_horizontal ? "Y" : "X" );
        this.#apothem = this.#MathApothem( d, this.#nr_faces );

        for ( var idx = 0; idx < this.#nr_faces; ++ idx ) {
            this.#lst_faces[ idx ].style.transform = [
                "rotate" + axis + "(" + (-idx * this.#angle) + "deg)",
                "translateZ(" + this.#apothem + "px)"
            ].join( " " );
        }
    }

    #AddToFrontIdx ( d ) {
        this.#front_idx = this.#MathMod( this.#front_idx + d );
    }

    #ApplyTransform () {
        this.#faces_wrapper.style.transform = [
            "translateZ(-" + this.#apothem + "px)",
            "rotateX(" + this.#rx + "deg)",
            "rotateY(" + this.#ry + "deg)",
            "rotateZ(" + this.#rz + "deg)"
        ].join( " " );
    }
    
    #MathApothem ( l, n ) {
        return Math.ceil(
            l / ( 2 * Math.tan( Math.PI / n ) )
        );
    }

    #MathMod ( n ) {
        const m = this.#nr_faces;
        n = n % m;
        return ( n >= 0 ? n : ( n + m ) );
    }

    #MathRandomInt = function ( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    #RotateX ( dx ) {
        this.#rx += ( dx * this.#angle );
        this.#ApplyTransform();
    }
    
    #RotateY ( dy ) {
        this.#ry += ( dy * this.#angle );
        this.#ApplyTransform();
    }
    
    // #RotateZ ( dz ) {
    //     this.#rz += (dz * this.#angle );
    //     this.#ApplyTransform();
    // }

    #RotateH ( d ) {
        const hz = this.#is_horizontal;
        this.#is_horizontal = true;

        if ( hz !== this.#is_horizontal ) {
            this.#rx = 0;
            this.#ry = ( this.#front_idx * this.#angle ) % 360;
            this.#PlaceFaces();
        }

        this.#RotateY( d );
        this.#AddToFrontIdx( d );
    }

    #RotateV ( d ) {
        const hz = this.#is_horizontal;
        this.#is_horizontal = false;

        if ( hz !== this.#is_horizontal ) {
            this.#ry = 0;
            this.#rx = ( this.#front_idx * this.#angle ) % 360;
            this.#PlaceFaces();
        }
        this.#RotateX( d );
        this.#AddToFrontIdx( d );
    }
    
    //== Public interface

    GetElement () {
        return this.#container_3d;
    }
    
    GetFaceElement ( idx ) {
        return this.#lst_faces[ this.#MathMod( idx ) ];
    }

    GetFaceElements () {
        //** Return a copy
        return this.#lst_faces.concat();
    }

    Step ( n = 1 ) {
        if ( this.#is_horizontal ) {
            this.#RotateH( n );
        } else {
            this.#RotateV( n );
        }

        return this.#front_idx;
    }

    GetFront () {
        return this.#front_idx;
    }

    SetFront ( d = 0 ) {
        d = this.#MathMod( d );
        
        if ( d !== this.#front_idx ) {
            const step1 = d - this.#front_idx;
            const step2 = ( step1 > 0 ? ( step1 - this.#nr_faces ) : ( this.#nr_faces + step1 ) );
            const step = ( Math.abs( step2 ) < Math.abs( step1 ) ) ? step2 : step1;
            this.Step( step );
        }

        return d;
    }

    SetRandomFront ( should_move = false ) {
        var n = -1;

        do {
            n = this.#MathRandomInt( 0, this.#nr_faces - 1 );
        } while ( should_move && n === this.#front_idx );

        return this.SetFront( n );
    }

    SetPerspective ( value ) {
        if ( typeof value === "number" ) {
            value += "px";
        }
        this.#container_3d.style.perspective = value;
    }

	SetSize ( width, height ) {
		this.#width = width;
        this.#height = height;
		
		this.#container_3d.style.width = this.#width + "px";
        this.#container_3d.style.height = this.#height + "px";
		
		this.#PlaceFaces();
        this.#AddToFrontIdx( 0 );
        this.#ApplyTransform();
	}

    GetFaceIdx( face ) {
        return parseInt( face.dataset.idx, 10 );
    }
}
//** File: c_Card.js

"use strict;"

class Card extends FlexBoxEntity {
	#id = null;
	#suit = -1;
	#value = -1;
	#color = -1;
	#face_up = true;
	#selected = false;
	#show_royals_value = true;
	#marked = false;
	#location = null;

	#e_body = null;
	#e_face = null;
	#e_back = null;
	#e_value = null;
	#e_value_nr = null;
	#e_value_marker = null;
	#e_suit = null;

	//** suit:	{ id, color, symbol }
	//** value: { nr, symbol }
	constructor ( id, suit, value ) {
		// 
		super( "Card_" + id, true );

		this.#id = id;
		this.#suit = suit.id;
		this.#value = value.nr;
		this.#color = suit.color;
		
		this.MakeBody( value.symbol, value.nr, suit.symbol );
		
		this.ShowRoyalsValue( this.#show_royals_value );
	}

	// SetPosition ( top, left ) {
	// 	super.SetPosition( top, left );
	// 	return Delay( CARD_TRANSLATION_TIME, this );
	// }

	GetClickTarget () {
		return this.#e_body;
	}

	ShowRoyalsValue ( status ) {
		this.#show_royals_value = status;
		
		if ( status && ( this.IsRoyal() || this.IsAce() ) ) {
			this.#e_value_nr.classList.remove( "Hidden" );
		} else {
			this.#e_value_nr.classList.add( "Hidden" );
		}
	}

	MakeBody ( value_symbol, value_nr, suit_symbol ) {
		this.#e_body = document.createElement( "div" );
		this.#e_body.classList.add( "CardBody" );
		this.#e_body.classList.add( "Clickable" );
		
		this.#e_face = document.createElement( "div" );
		this.#e_face.classList.add( "CardFace" );
		this.#e_body.appendChild( this.#e_face )
		
		this.#e_back = document.createElement( "div" );
		this.#e_back.classList.add( "CardBack" );
		this.#e_body.appendChild( this.#e_back )

		this.#e_value = document.createElement( "p" );
		this.#e_value.classList.add( "CardValue" );
		this.#e_value.classList.add( "CardValue" + this.#color );
		const SPAN = document.createElement( "span" );
		SPAN.innerHTML = value_symbol;
		this.#e_value.appendChild( SPAN );
		this.#e_face.appendChild( this.#e_value );

		this.#e_value_nr = document.createElement( "span" );
		if ( this.IsRoyal() || this.IsAce() ) {
			this.#e_value_nr.innerHTML = value_nr;
		}
		this.#e_value.appendChild( this.#e_value_nr );
		this.#e_value_marker = document.createElement( "span" );
		// this.#e_value_marker.innerHTML = "*";
		this.#e_value.appendChild( this.#e_value_marker );
		
		this.#e_suit = document.createElement( "p" );
		this.#e_suit.innerHTML = suit_symbol;
		this.#e_suit.classList.add( "CardSuit" );
		this.#e_suit.classList.add( "CardSuit" + this.#color );
		this.#e_face.appendChild( this.#e_suit );

		if ( ! this.#face_up ) {
			this.#e_body.classList.add( "FaceDown" );
		}

		if ( this.IsRoyal() ) {
			this.#e_face.classList.add( "CardRoyal" );
		} else if ( this.IsJoker() ) {
			this.#e_face.classList.add( "CardJoker" );
		} else if ( this.IsAce() ) {
			this.#e_face.classList.add( "CardAce" );
		}

		const ELEMENT = this.GetElement();
		ELEMENT.classList.add( "Card" );
		ELEMENT.classList.add( "CardSmooth" );
		ELEMENT.classList.add( "CardHidden" );
		ELEMENT.appendChild( this.#e_body );
	}

	GetValue () {
		return this.#value;
	}
	
	GetSuit () {
		return this.#suit;
	}
	
	GetColor () {
		return this.#color;
	}

	SetSize ( width, height ) {
		super.SetSize( width, height );
		// this.#e_body.style.fontSize = Math.round( width * 0.33 ) + "px";
		this.#e_value.style.fontSize = Math.round( width * 0.3 ) + "px";
		if ( this.#e_value.children.length ) {
			this.#e_value.children[ 1 ].style.fontSize = Math.round( width * 0.2 ) + "px";
		}
		this.#e_suit.style.fontSize = Math.round( width * 0.4 ) + "px";
	}

	SetFaceUp ( status ) {
		this.#face_up = status;
		this.#e_body.classList[ status ? "remove" : "add" ]( "FaceDown" );
	}
	
	SetSelected ( status ) {
		this.#selected = status;
		this.#e_body.classList[ status ? "add" : "remove" ]( "CardSelected" );
	}
	
	ToggleSelected () {
		this.SetSelected( ! this.#selected );

		return this.#selected;
	}
	
	ClearLocation () {
		this.#location = null;
	}

	SetLocation ( entity ) {
		

		this.#location = entity;
	}
	
	IsAt ( entity ) {
		

		return ( this.#location === entity );
	}
	
	GetLocation () {
		return this.#location;
	}
	
	IsRoyal () {
		return [ ROYAL_JACK, ROYAL_QUEEN, ROYAL_KING ].includes( this.#value );
	}

	IsFaceCard () {
		return this.IsRoyal();
	}
	
	IsJoker () {
		return ( this.#value === ROYAL_JOKER );
	}
	
	IsAce () {
		return ( this.#value === ROYAL_ACE );
	}
	
	IsNumber () {
		return ( this.#value <= 10 );
	}
	
	IsFaceUp () {
		return this.#face_up;
	}
	
	IsSelected () {
		return this.#selected;
	}

	SetHidden ( status ) {
		// 
		this.GetElement().classList[ status ? "add" : "remove" ]( "CardHidden" );
	}
	
	SetSmooth ( status ) {
		this.GetElement().classList[ status ? "add" : "remove" ]( "CardSmooth" );
	}

	SetZindex (value ) {
		this.GetElement().style.zIndex = value;
	}

	IsRoyalOrAce () {
		return ( this.IsRoyal() || this.IsAce() );
	}

	ToString () {
		return "#" + this.#id + "=" + this.#value + "/" + SUIT_NAMES[ this.#suit ];
	}

	SetMarker ( status, value = "&bull;" ) {
		this.#marked = status;

		this.#e_value.classList[ status ? "add" : "remove" ]( "Marked" );
		
		// if ( status ) {
		// 	this.#e_value_marker.innerHTML = value;
		// } else {
		// 	this.#e_value_marker.innerHTML = "";
		// }

		return status;
	}

	IsMarked () {
		return this.#marked;
	}

	Reset () {
		this.SetSelected( false );
		this.SetMarker( false );
		this.SetFaceUp( false );
	}
}

//** EOF//** File: c_CardGame.js

"use strict;"

class CardGame {

	#viewport = null;
	#messenger = null;
	#menu = null;
	#deck = null;
	#piles_row = null;
	#draw_pile = null;
	#discard_pile = null;
	#trophies_pile = null;
	#dice_row = null;
	#draw_row = null;
	#store = null;

	#busy = false;

	#lst_cults = [];
	#round = 0;
	#round_phase = 0;
	#game_over = false;
	#attack_cult = NO_CULT;
	#attack_nr = 0;
	#defeated_targets = false;
	#selected_planet = null;
	#continue = null;

	#lst_cards_out = null;
	#blood = 0;
	#use_blood = 0;

	#planet_protection = PLANET_PROTECTION_ALL;
	#tmo_cost = 0;

	constructor () {
		this.clicked_card = null; //** DEBUG AID
		this.#use_blood = parseFloat( QuerySeachString( "use_blood", 0 ) );
		this.#planet_protection = parseInt( QuerySeachString( "planet_protection", PLANET_PROTECTION_ALL ) );
		this.#tmo_cost = parseInt( QuerySeachString( "tmo_cost", 0 ) );
		
		
		A0.Init( this.#onResize.bind( this ), this.#onClick.bind( this) );
		A0.SetErrorHandlers();
		A0.SetPageMode( A0.PAGE_LANDSCAPE, "Rotate" );
		
		this.#viewport = eById( "GameViewport" );
		this.#messenger = new Messenger( SHOW_TIME );
		this.#menu = new Menu( eById( "MenuPannel" ), eById( "MenuIcon" ) );
		this.#deck = new Deck( NR_JOKERS );
		this.#piles_row = new PilesRow();
		this.#dice_row = new DiceRow( NR_START_DICE, this.onNewDie.bind( this ) );
		this.#draw_row = new CardsRow( "DrawRow", 7, true );
		this.#draw_row.SetJustify( "center" );
		this.#draw_row.SetAddFaceUp( false );
		this.#store = new Store(
			eById( "Store" ),
			this.MakeStoreData.bind( this ),
			this.#use_blood
		);
		
		this.#draw_pile = this.#piles_row.GetDrawPile();
		this.#discard_pile = this.#piles_row.GetDiscardPile();
		this.#trophies_pile = this.#piles_row.GetTrophiesPile();

		this.#viewport.appendChild( this.#draw_row.GetElement() );

		AppendChildren( this.#viewport, this.#piles_row.GetElements() );
		AppendChildren( this.#viewport, this.#dice_row.GetElements() );

		for ( var cult, n = 0; n < NR_CULTS; ++ n ) {
			cult = new Cult( n );
			this.#lst_cults.push( cult );
			AppendChildren( this.#viewport, cult.GetElements() )
		}
		
		eById( "Play" ).appendChild( this.#messenger.GetElement() );
		
		A0.AddEventListener(
			window, "contextmenu", A0.ConsumeEvent.bind(A0)
		);
		A0.AddClickEventListener(
			eById( "HomeCard" ), null
		);
		A0.AddClickEventListener(
			eById( "MenuIcon" ), null
		);
		A0.AddClickEventListener(
			this.#messenger.GetClickTarget(), this.#messenger
		);
		this.#menu.GetElements().forEach(
			e => A0.AddClickEventListener( e, null )
		);

		A0.AddClickEventListener(
			this.#draw_pile.GetClickTarget(), this.#draw_pile
		);
		A0.AddClickEventListener(
			this.#discard_pile.GetClickTarget(), this.#discard_pile
		);
		A0.AddClickEventListener(
			this.#trophies_pile.GetClickTarget(), this.#trophies_pile
		);
		A0.AddClickEventListener(
			this.#draw_row.GetElement(), this.#draw_row
		);
		this.#dice_row.GetClicktargets().forEach(
			tgt => {
				A0.AddClickEventListener(
					tgt, this.#dice_row.GetDieByClickTarget( tgt )
				);
			}
		);
		this.#store.GetClickTargets().forEach(
			tgt => {
				A0.AddClickEventListener(
					tgt, this.#store
				);
			}
		);

		this.#onResize( 0, 0 );
		this.#menu.Hide();
		this.#store.Hide();
		this.#InitCards();

		window.setTimeout(
			() => {
				A0.TestPageMode();
				eById( "AppViewport" ).classList.remove( "AppInit" );
			},
			1E3/16
		);

		

		// this.#Debug();
	}

	// #Debug () {
	// 	
	// 	this.Deck = this.#deck;
	// 	this.Menu = this.#menu;
	// 	this.Messenger = this.#messenger;
	// 	this.Draw = this.#draw_pile;
	// 	this.Discard = this.#discard_pile;
	// 	this.DiceRow = this.#dice_row;
	// 	this.LstCults = this.#lst_cults;
	// 	this.DrawRow = this.#draw_row;
	// 	this.Store = this.#store;
	// 	this.Trophies = this.#trophies_pile;

	// 	this.#onClickMenuIcon( "Play" );
	// }

	// Teste ( n = 3 ) {
	// 	var card;
	// 	while ( n -- >= 0 ) {
	// 		card = this.#draw_pile.GetCardFromTop();
	// 		this.#draw_row.AddCard( card);
	// 		this.PlaceDrawnCard();
	// 	}
	// }

	#InitCards () {
		var card;

		while ( ( card = this.#deck.GetCard() ) !== null ) {
			card.ShowRoyalsValue( false );
			this.#viewport.appendChild( card.GetElement() );
			A0.AddClickEventListener( card.GetClickTarget(), card );
			
			card.SetHidden( false );
			this.#discard_pile.AddCard( card );
		}

		while ( ! this.#discard_pile.IsEmpty() ) {
			this.#draw_pile.AddCard( this.#discard_pile.GetCardFromTop() );
		}
	}

	#onResize ( width, height ) {
		const SPACING = this.#viewport.offsetTop;
		const WIDTH = this.#viewport.offsetWidth;

		const CELL_WIDTH = Math.round( WIDTH / 9 );
		const CELL_HEIGHT = Math.round( this.#viewport.offsetHeight / 5 );

		const [ CARD_WIDTH, CARD_HEIGHT ] = this.#CalcCardSize( CELL_WIDTH, CELL_HEIGHT, SPACING );

		

		this.#deck.SetCardsSize( CARD_WIDTH, CARD_HEIGHT );
		
		this.#messenger.onResize(
			WIDTH, Math.round( CARD_HEIGHT / 2),
			0, this.#viewport.offsetLeft
		);

		const W = Math.round( 6.5 * CELL_WIDTH );

		for ( var cult, top = Math.round( 0.5 * SPACING ), n = 0; n < NR_CULTS; ++ n ) {
			cult = this.#lst_cults[ n ];
			cult.onResize(
				W, CELL_HEIGHT - SPACING,
				top, 0,
				CELL_WIDTH
			);
			top += CELL_HEIGHT;
		}

		const W2 = Math.round( ( this.#viewport.offsetWidth - W )  / 2 );

		this.#dice_row.onResize(
			W2, 4 * CELL_HEIGHT,
			0, W,
			W2 - 2 * SPACING,
			Math.floor( 4 * CELL_HEIGHT / 6 - SPACING )
		);

		this.#piles_row.onResize(
			W2, 4 * CELL_HEIGHT,
			0, W + W2,
			CARD_WIDTH, CARD_HEIGHT
		);

		this.#draw_row.onResize(
			W, CELL_HEIGHT - SPACING,
			top, 0
		);

		this.#store.onResize(
			WIDTH, Math.ceil( CELL_HEIGHT + SPACING * 0.55 ),
			this.#viewport.offsetLeft
		);
	}

	#CalcCardSize ( cell_width, cell_height, spacing ) {
		const K = 2 * spacing;
		var card_width = cell_width - K;
		var card_height = Math.round( card_width * CARD_ASPECT_RATIO );
		
		if ( card_height > cell_height - K ) {
			card_height = cell_height - K;
			card_width = Math.round( card_height / CARD_ASPECT_RATIO );
		}

		return [ card_width, card_height ];
	}

	#MoveGroupOfCards ( time_factor, nr_cards, fn ) {
		if ( nr_cards === 0 ) {
			return Promise.resolve( null );
		}

		const lst_promises = [];
		const MS = CARD_TRANSLATION_TIME * time_factor;
		var delay = 0;

		

		while ( nr_cards -- > 0 ) {
			lst_promises.push(
				Delay( delay ).then(
					_ => {
						fn();
					}
				)
			);
			delay += MS;
		}
		
		lst_promises.push( Delay( delay - MS + CARD_TRANSLATION_TIME ) );

		return Promise.all( lst_promises );
	}
	
	#DrawCardsToCardRow ( draw_pile, card_row, nr_cards, to_end = true ) {
		

		const lst = [];

		return this.#MoveGroupOfCards(
			DrawCardsToCardRow_TIME_FACTOR,
			Math.min( nr_cards, draw_pile.GetNrCards() ),
			_ => {
				let card = draw_pile.GetCardFromTop();
				card_row.AddCard( card, to_end );
				lst.push( card );
				if ( ! this.#lst_cards_out.includes( card ) ) {
					this.#lst_cards_out.push( card );
				}
			}
		).then(
			_ => Promise.resolve( lst )
		);
	}

	#DiscardRemainingCards () {
		this.#deck.ForEachCard( card => card.SetSmooth( false ) );
		
		const DISCARD = this.#discard_pile;
		
		this.#draw_pile.SendCardsToPile( DISCARD );
		this.#trophies_pile.SendCardsToPile( DISCARD );
		this.#lst_cults.forEach( c => c.ClearCards( DISCARD ) );
		this.#draw_row.ClearCards( DISCARD );
	}

	#MakeDrawPile () {
		this.#SendCardsToPile( this.#deck.GetRemainingCards(), this.#draw_pile );

		setTimeout(
			_ => this.#deck.ForEachCard( card => card.SetSmooth( true ) ),
			0
		);
	}

	#SendCardsToPile ( lst_cards, target_pile ) {
		

		var card;

		while ( lst_cards.length > 0 ) {
			card = lst_cards.pop();
			
			card.GetLocation().RemoveCard( card );
			target_pile.AddCard( card );
		}
	}
	
	#Warn ( txt ) {
		if ( this.#continue === null ) {
			
			this.#messenger.ShowMessage( txt );
		} else {
			
			
		}
	}

	//** ======================================================================

	#onClick ( js_entity, evt_target ) {
		// 

		if ( this.#menu.IsIcon( evt_target ) ) {
			return this.#onClickMenuIcon( evt_target.id.split( "_" ).pop() );
		}
		if ( evt_target.id === "HomeCard" ) {
			return this.#onClickMenuIcon( "Play" );
		}
		if ( this.#continue !== null ) {
			if ( js_entity === this.#messenger ) {
				this.#continue();
				
			} else {
				
				
				
			}
			return;
		}
		if ( this.#busy ) {
			
			return;
		}
		if ( this.#game_over ) {
			
			return;
		}

		if ( js_entity instanceof Card ) {
			if ( js_entity.IsFaceUp() || js_entity.IsAt( this.#draw_row ) ) {
				this.#onClickCard( js_entity );
			} else {
				this.#onClickCardPile( js_entity.GetLocation() );
			}
		} else if ( js_entity instanceof CardPile ) {
			this.#onClickCardPile( js_entity );
		} else if ( js_entity instanceof Die ) {
			this.OnClickDie( js_entity, evt_target );
		} else if ( js_entity === this.#store ) {
			this.onClickStoreItem( evt_target );
		}  else if ( js_entity === this.#draw_row ) {
			if ( this.#round_phase === PHASE_PLACE_DRAWN ) {
				const CARD = this.#draw_row.PeekFirstCard();
				if ( CARD !== null ) {
					this.TestPlaceDrawnCard( CARD );
				}
			}		
		} else {
			
		}
	}

	OnClickDie ( die, evt_target ) {
		

		if ( this.#round_phase !== PHASE_ATTACK ) {
			return this.#Warn( "Not on attack phase." );
		}

		if ( evt_target === die.GetClickTarget() ) {
			die.ToggleSelected();
		} else {
			if ( die.CanReroll() || this.#store.IsRerollAvailable() ) {
				this.#busy = true;
				if ( ! die.CanReroll() ) {
					this.#store.UseReroll();
					die.SetReroll( true );
				}
				die.Reroll().then(
					_ => {
						return this.ProcessRolledDice( false ); //** false: Signal reroll
					}
				);
			}
		}
	}

	#onClickMenuIcon ( id ) {
		

		if ( id === "MenuIcon" ) {
			this.#menu.Toggle();
		} else if ( id === "Play" ) {
			if ( A0.GetCurrentPageId() === "Play" ) {
				this.#Start();
			} else {
				this.#menu.ShowIcon( true );
				this.#menu.Show();
				A0.ShowPage( "Play" );
			}
		} else if ( id === "Home" ) {
			this.#menu.Hide();
			this.#menu.ShowIcon( false );
			A0.ShowPage( "Home" );
		} else {
			A0.ShowPage( id );
		}
	}

	#onClickCard ( card ) {
		
		
		this.clicked_card = card; //** DEBUG

		if ( this.#busy ) {
			
			return;
		}

		if ( this.#round_phase === PHASE_PLACE_DRAWN ) {
			this.TestPlaceDrawnCard( card );
		} else if ( this.#round_phase === PHASE_ATTACK ) {
			if ( card.IsAce() ) {
				this.TestAttackPlanet( card );
			} else {
				this.TestAttackCard( card );
			}
		} else {
			
		}
	}

	GetCardCultByLocation ( card ) {
		const location = card.GetLocation().GetId().split( "_" );

		if ( ! [ "Planet", "Horror", "Cultists" ].includes( location[ 0 ] ) ) {
			return null;
		}

		return this.#lst_cults[  parseInt( location[ 1 ], 10 ) ];
	}

	TestAttackCard ( card ) {
		//** Note: card is Cultist (Number) or Horror (Royal)
		

		const CULT = this.GetCardCultByLocation( card );
		if ( CULT === null ) {
			return this.WarnAndUnselectDie( "Card is not at a cult." );
		}

		if ( card.IsNumber() && this.#store.HasSacrificeRequest() ) {
			return this.TestSacrifice( card );
		}

		if ( this.#attack_cult !== NO_CULT && this.#attack_cult !== CULT.GetId() ) {
			return this.WarnAndUnselectDie( "You are now attacking " + this.GetCultName( this.#attack_cult ) + "." );
		}

		if ( card.IsNumber() && CULT.HasHorror() ) {
			return this.WarnAndUnselectDie( "Cultist is protected by a Horror. You may use a sacrifice." );
		}

		const lst_dice_values = this.#dice_row.GetSelectionValues();
		if ( lst_dice_values.length === 0 ) {
			if ( card.IsRoyal() ) {
				const VALUE = card.GetValue();
				var txt;
				if ( VALUE === ROYAL_JACK ) {
					txt = "Pair of identical dice";
				} else if ( VALUE === ROYAL_QUEEN ) {
					txt = "3 dice run";
				} else {
					txt = "4 matching dice"
				}
				return this.#Warn(
					"Level " + ( VALUE - 10 ) + " Horror &raquo; " + txt + "."
				);
			}
			if ( card.IsNumber() ) {
				return this.#Warn(
					"Cultist &raquo; 1 Die | 2+ Matching Dice | 3+ Dice Run | Precision | Sacrifice"
				);
			}
			return this.WarnAndUnselectDie( "Select a die, or dice combination, before attacking a card." );
		}

		if ( ! this.ValidateAttack( lst_dice_values, card ) ) {
			if ( lst_dice_values.length === 1 ) {
				return this.WarnAndUnselectDie( "Die cannot be used against this card." );
			}
			return this.WarnAndUnselectDie( "Dice combination cannot be used against this card." );
		}

		

		if ( this.#attack_cult === NO_CULT ) {
			this.#attack_cult = CULT.GetId();
			CULT.SetUnderAttack( true );
			this.#store.Show();
			
		} 

		this.PerformCardAttack( CULT, card );
	}
	
	WarnAndUnselectDie ( txt ) {
		this.#Warn( txt );
		this.#dice_row.UnSelectSelectedDie();
	}

	PerformCardAttack ( cult, card ) {
		
		
		
		this.#dice_row.SetSelectionUsed();

		this.#defeated_targets = true;

		if ( card.IsNumber() ) {
			this.#blood += card.GetValue();
			// this.#store.Show();
		}
		
		this.#MoveGroupOfCards(
			ONE_CARD_TIME_FACTOR,
			1,
			_ => {
				cult.RemoveCard( card );
				this.#trophies_pile.AddCard( card );
			}
		).then(
			_ => {
				
				this.#store.Show();
				if ( this.#dice_row.AllDieWereUsed() ) {
					
					if ( this.#attack_nr === 1 ) {
						if ( cult.HasTargets() ) {
							this.#Warn( "Starting 2nd attack on " +  this.GetCultName( this.#attack_cult ) + "..." );
							this.#dice_row.RemoveTempDies();
							return this.ResetAndRollDice().then(
								_ => {
									
									this.#store.Show();
								}
							);
						} else {
							
							this.#dice_row.SetAllAsUsed( true );
							this.#busy = false;
						}
					} else {
						
					}
				}
			}
		);
	}

	GetCultName ( cult_id ) {
		if ( cult_id === NO_CULT ) {
			return 
		}
		if ( cult_id instanceof Cult ) {
			cult_id = cult_id.GetId();
		}
		return SUIT_NAMES[ cult_id ].toUpperCase()
	}

	ValidateAttack ( lst_dice_values, card ) {
		const CARD_VALUE = card.GetValue();
		const DICE_ROW = this.#dice_row;
		
		if ( card.IsNumber() ) {
			//** Cultist
			if ( DICE_ROW.TestSingle( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.TestMatch( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.TestRun( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.TestPrecision( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			return false;
		}
		
		if ( card.IsRoyal() ) {
			//** Horror
			if ( CARD_VALUE === ROYAL_JACK ) {
				//** Jacks: May only be slain with a pair of identical dice
				if ( lst_dice_values.length !== 2 ) {
					return false;
				}
				return DICE_ROW.IsMatch( lst_dice_values ) !== 0;
			}

			if ( CARD_VALUE === ROYAL_QUEEN ) {
				//** Queens: Require a 3 Dice Run
				if ( lst_dice_values.length !== 3 ) {
					return false;
				}
				return DICE_ROW.IsRun( lst_dice_values );
			}

			//** King: Requires 4 Matching dice
			
			if ( lst_dice_values.length !== 4 ) {
				return false;
			}
			return DICE_ROW.IsMatch( lst_dice_values ) !== 0;
		}

		//** Aces (Planets)
		//** These cards may be countered with the Alignment Control magic
		
		
		return false;
	}

	#onClickCardPile ( card_pile ) {
		

		if ( this.#busy ) {
			
			return;
		}

		if ( card_pile === this.#draw_pile ) {
			if ( this.#selected_planet !== null ) {
				this.TestPlanetAction( "reshuffle" );
			} else {
				this.EndAttackAndDraw();
			}
		} else if ( card_pile === this.#discard_pile ) {
			if ( this.#selected_planet !== null ) {
				this.TestPlanetAction( "discard" );
			}
		} else if ( card_pile === this.#trophies_pile ) {
			this.#store.Toggle();
		}
	}
	
	#Start () {
		

		if ( this.#busy ) {
			
			return;
		}
		
		this.#busy = true;
		this.#game_over = false;
		this.#selected_planet = null;
		this.#blood = 0;

		this.#lst_cults.forEach(
			cult => cult.Reset()
		);

		this.#messenger.Hide();
		this.#menu.Hide();
		this.#menu.EnablePlay( false );

		this.#dice_row.Reset();
		
		this.#DiscardRemainingCards();
		this.#deck.Reset();
		this.#deck.Shuffle();
		this.#MakeDrawPile();

		this.#lst_cards_out = [];

		this.#discard_pile.SetDelay( CARD_TRANSLATION_TIME );
		this.#trophies_pile.SetDelay( CARD_TRANSLATION_TIME );

		this.NewRound();

		setTimeout(
			() => {
				this.#menu.EnablePlay( true );
				this.#discard_pile.SetDelay( CARD_TRANSLATION_TIME );
				this.#trophies_pile.SetDelay( CARD_TRANSLATION_TIME );
			},
			NR_CARDS_PER_TURN * CARD_TRANSLATION_TIME
		);
	}

	FindFullCult () {
		

		var summon_cult_id = NO_CULT;
		this.#lst_cults.forEach(
			cult => {
				if ( cult.HasMaxCultists() ) {
					summon_cult_id = cult.GetId();
				}
			}
		);
		
		
		return summon_cult_id;
	}

	NewRound () {
		this.#round += 1;
		

		this.#busy = true;

		var summon_cult_id = this.FindFullCult();
		if ( summon_cult_id !== NO_CULT ) {
			return this.GameOver( false, GAME_OVER_SUMMON, summon_cult_id );
		}

		this.#round_phase = PHASE_DRAW;
		if ( this.#attack_cult !== NO_CULT ) {
			this.#lst_cults[ this.#attack_cult ].SetUnderAttack( false );
		}
		this.#attack_cult = NO_CULT;
		this.#attack_nr = 0;
		this.#defeated_targets = false;
		
		this.#dice_row.RemoveTempDies();
		this.#dice_row.SetAllAsUsed( true );
		this.#store.Hide();

		var nr_planets = 0;
		this.#lst_cults.forEach(
			cult => {
				nr_planets += ( cult.HasPlanet() ? 1 : 0 );
				cult.ClearPlanetMarker();
			}
		);

		this.DrawCards( nr_planets );
	}

	DrawCards ( nr_planets ) {
		

		if ( this.#draw_pile.IsEmpty() ) {
			return this.GameOver( true );
		}

		this.#DrawCardsToCardRow(
			this.#draw_pile, this.#draw_row, NR_CARDS_PER_TURN + nr_planets
		).then(
			lst_cards => {
				
				this.#draw_row.PeekFirstCard().SetFaceUp( true );
				this.#round_phase = PHASE_PLACE_DRAWN;
				this.#busy = false;
				
			}
		);
	}

	TestPlaceDrawnCard ( card ) {
		if ( ! card.IsAt( this.#draw_row ) ) {
			return this.#Warn( "Place cards from the draw row." );
		}

		//** OK to  place drawn card

		this.#busy = true;
		
		if ( card.IsAce() ) {
			this.#DrawCardsToCardRow(
				this.#draw_pile, this.#draw_row, 1
			);
		}

		this.PlaceDrawnCard().then(
			_ => {
				this.#busy = false;
				if ( card.IsNumber() ) {
					if ( card.GetLocation().IsFull() ) {
						return this.GameOver( false, GAME_OVER_SUMMON, card.GetSuit() );
					}
				}
				if ( this.#draw_row.IsEmpty() ) {
					
					return this.ResetAndRollDice();
				} else {
					this.#draw_row.PeekFirstCard().SetFaceUp( true );
				}
			}
		);
	}

	PlaceDrawnCard () {
		const CARD = this.#draw_row.GetFirstCard(); //** Remove card from card row
		
		CARD.SetFaceUp( true );

		const CULT = this.#lst_cults[ CARD.GetSuit() ];

		if ( CARD.IsNumber() ) {
			return this.PlaceDrawnCultist( CULT, CARD );
		}
		
		if ( CARD.IsAce() ) {
			return this.PlaceDrawnPlanet( CULT, CARD );
		}
		
		//** CARD.IsRoyal()
		return this.PlaceDrawnHorror( CULT, CARD );
	}

	PlaceDrawnHorror ( cult, drawn_horror ) {
		
		
		

		
		

		if ( cult.GetNrCultists() < drawn_horror.GetValue() - 10 ) {
			//** Horror cannot be summoned
			
			return this.AddTrophy( drawn_horror );
		}

		if ( ! cult.HasHorror() ) {
			
			return this.#MoveGroupOfCards(
				ONE_CARD_TIME_FACTOR,
				1,
				_ => {
					cult.AddHorror( drawn_horror );
				}
			);
		}
		
		//** Cult already has a horror
		const horror = cult.PeekHorror();

		
		
		

		//** Discard the lower value of the two horrors
		if ( horror.GetValue() < drawn_horror.GetValue() ) {
			
			return this.#MoveGroupOfCards(
				ONE_CARD_TIME_FACTOR,
				1,
				_ => {
					cult.RemoveCard( horror );
					this.#discard_pile.AddCard( horror ); }
			).then(
				_ => {
					cult.AddHorror( drawn_horror );
				}
			);
		} else {
			return this.#MoveGroupOfCards(
				ONE_CARD_TIME_FACTOR,
				1,
				_ => {
					this.#discard_pile.AddCard( drawn_horror );
				}
			);
		}
	}

	PlaceDrawnCultist ( cult, card ) {
		
		

		return this.#MoveGroupOfCards(
			ONE_CARD_TIME_FACTOR,
			1,
			_ => {
				cult.AddCultist( card );
			}
		);
	}
	
	PlaceDrawnPlanet ( cult, card ) {
		
		

		return this.#MoveGroupOfCards(
			ONE_CARD_TIME_FACTOR,
			1,
			_ => {
				cult.AddPlanet( card, this.#round );
			}
		);
	}

	AddTrophy ( card ) {
		

		return this.#MoveGroupOfCards(
			ONE_CARD_TIME_FACTOR,
			1,
			_ => {
				const location = card.GetLocation();
				if ( location !== null ) {
					location.RemoveCard( card );
				}
				this.#trophies_pile.AddCard( card );
			}
		).then(
			() => {
				if ( this.#round_phase !== PHASE_PLACE_DRAWN ) {
					this.#store.Show();
				}
			}
		);
	}

	ResetAndRollDice () {
		

		this.#busy = true;
		this.#round_phase = PHASE_ROLL_DICE;

		this.#dice_row.ResetDie();

		return this.#dice_row.Roll().then(
			lst_results => {
				
				this.ProcessRolledDice( lst_results );
			}
		);
	}

	ProcessRolledDice ( lst = null ) {
		

		if ( lst === false ) {
			
		}
		const REROLL = ( lst === false );

		if ( lst === null || lst === false ) {
			lst = this.#dice_row.GetDiceValues();
		}

		var idx, data, die, nr_1s = 0;
		for ( idx = 0; idx < lst.length; ++ idx ) {
			data = lst[ idx ];
			
			die = this.#dice_row.GetDieById( data.id );
			if ( data.value === 1 ) {
				nr_1s += 1;
				die.SetReroll( false );
			} else {
				die.SetReroll( ! die.HasRerolled() );
			}
		}

		

		if ( nr_1s > lst.length / 2 ) {
			this.SufferInjury( true, nr_1s );
		} else if ( ! REROLL ) {
			this.StartAttackPhase();
		} else {
			this.#busy = false; //** Continue attack phase
		}
	}

	StartAttackPhase () {
		

		this.#round_phase = PHASE_ATTACK;
		this.#attack_nr += 1;
		this.#defeated_targets = false;

		this.#store.Show();
		this.Help();

		this.#busy = false;

	}

	SufferInjury ( to_many_1s, nr_1s = 0 ) {
		

		const NR_INJURIRES = 1 + this.#dice_row.NrDeadDice();
		
		

		var txt = "You suffred an injury: ";
		if ( to_many_1s ) {
			txt += "to many 1s."
		} else {
			txt += "no defeated targets."
		}

		this.Alert( txt ).then(
			() => {
				if ( NR_INJURIRES === MAX_INJURIES ) {
					this.GameOver( false, GAME_OVER_INJURIES );
				} else {
					var remove_die = true;
					if ( to_many_1s && this.#tmo_cost > 0 ) {
						const COST = this.#tmo_cost * nr_1s;
						
						if ( this.#trophies_pile.GetNrCards() >= COST ) {
							remove_die = false;
							this.#Warn(
								"Paying " + COST + " trophies to not lose a die."
							);
							this.#MoveGroupOfCards(
								1,
								COST,
								() => {
									this.#discard_pile.AddCard( this.#trophies_pile.GetCardFromTop() );
								}
							);
						} else {
							this.#Warn(
								"Cannot pay " + COST + " trophies to not lose a die."
							);
						}
					}
					if ( remove_die ) {
						this.#dice_row.RemoveDie();
					}
					this.NewRound(); //** busy @ PHASE_DRAW
				}
			}
		);
	}

	Alert ( txt ) {
		this.#messenger.Alert( txt );
		return new Promise(
			 ( resolve, _  ) => {
				this.#continue = () => {
					this.#continue = null;
					this.#messenger.ClearAlert();
					resolve();
				}
			}
		);
	}

	GameOver ( status, reason = null, suit_id = null) {
		
		
		this.#game_over = true;
		this.#busy = false;

		this.#messenger.ClearAlert();

		const PREFIX = "Round " + this.#round + " &raquo; ";

		if ( ! status ) {
			if ( reason === GAME_OVER_INJURIES ) {
				this.#messenger.ShowForever(
					PREFIX + "You suffered to many injuries and died.."
				);
			} else if ( reason === GAME_OVER_SUMMON ) {
				this.#lst_cults[ suit_id ].SelectCultists( true );
				this.#messenger.ShowForever(
					PREFIX + "The Cultists of " + this.GetCultName( suit_id )
					+ " mannaged to summon an Elder God. Darkness reigns!"
					);
			}
		} else {
			this.#messenger.ShowForever(
				PREFIX + "Well done! You fought with courage and wisdom."
			);
		}
	}

	EndAttackAndDraw () {
		

		if ( this.#round_phase !== PHASE_ATTACK ) {
			return this.#Warn( "Round " + this.#round + " &raquo; Not the time to draw cards." );
		}

		this.#store.Hide();

		//** Any full group of Cultists?
		// var summon_cult_id = this.summon_cult_id();
		// if ( summon_cult_id !== NO_CULT ) {
		// 	this.GameOver( false, GAME_OVER_SUMMON, summon_cult_id );
		// } else
		if ( ! this.#defeated_targets ) {
			
			if ( this.HasTargetsToAttack() ) {
				return this.SufferInjury( false ); //** GameOver || NewRound
			}
			
		}
		
		this.NewRound();
	}

	HasTargetsToAttack () {
		var has_targets = false;

		if ( this.#attack_cult === NO_CULT ) {
			this.#lst_cults.forEach(
				cult => {
					if ( cult.HasTargets() ) {
						has_targets = true;
					}
				}
			);
		} else {
			const CULT = this.#lst_cults[ this.#attack_cult ];
			has_targets = CULT.HasTargets();
		}

		return has_targets;
	}

	onNewDie ( die ) {
		const E = die.GetElement();
		this.#viewport.appendChild( E );
		A0.AddClickEventListener( E, die );
	}

	onClickStoreItem ( e_item ) {
		

		const NR_TROPHIES = this.#trophies_pile.GetNrCards();
		const TEST_ITEM = this.#store.TestItem( e_item, NR_TROPHIES, this.#blood );
		
		
		if ( TEST_ITEM === null ) {
			return 
		}

		const item_code = TEST_ITEM.item_code;

		if ( item_code === STORE_ALIGNMENT ) {
			return this.#Warn( "Requested &raquo; Alignment Control." );
		}
		if ( item_code === STORE_SACRIFICE ) {
			return this.#Warn( "Requested &raquo; Sacrifice." );
		}

		if ( TEST_ITEM.status === STORE_NO_FUNDS ) {
			var txt = "Not enough resources &raquo; Needed: "
			if ( this.#use_blood ) {
				txt += TEST_ITEM.trophies_cost + " trophies";
				txt += " and " + TEST_ITEM.blood_cost + " blood"
			} else {
				txt += TEST_ITEM.item_cost + " trophies";
			}
			return this.#Warn( txt + "." );
		}

		if ( ! this.ValidateItemCode( item_code ) ) {
			return;
		}
		
		// const item_cost = this.#store.GetItemCost( item_code );
		const item_cost = TEST_ITEM.item_cost;
		
		if ( isNaN( item_cost ) ) {
			return 
		}

		// 

		this.#store.Hide();

		// this.#blood -= TEST_ITEM.blood_cost;
		// 

		this.Pay(
			item_cost,
			item_code,
			{ blood_cost: TEST_ITEM.blood_cost, nr_trophies: NR_TROPHIES }
		).then(
			() => {
				this.ApplyStoreItem( item_code );
			}
		);
	}

	ValidateItemCode ( item_code ) {
		

		

		if ( item_code === STORE_SHIFT ) {
			if ( this.#round_phase !== PHASE_ATTACK ) {
				this.#Warn( "Not on attack phase." );
				return false;
			}
			if ( this.#attack_cult === NO_CULT ) {
				this.#Warn( "Not attacking a cult, yet." );
				return false;
			}
			return true;
		}
		
		if ( item_code === STORE_LUCK ) {
			return true;
		}
		
		if ( item_code === STORE_DIE ) {
			return true;
		}
		
		if ( item_code === STORE_FLESH ) {
			if ( this.#dice_row.NrDeadDice() === 0 ) {
				this.#Warn( "You have no dead dice." );
				return false;
			}
			return true;
		}

		if ( item_code === STORE_FLESH ) {
			return true;
		}
		
		if ( item_code === STORE_ARTIFACT ) {
			if ( this.#round_phase === PHASE_ATTACK ) {
				this.#Warn( "Cannot buy artifac during attack." );
				return false;
			}
			return true;
		}
		
		this.#Warn( "Sorry, not implemented." );

		return false;
	}

	MakeStoreData () {
		const lst = [];
		this.#lst_cults.forEach(
			cult => lst.push( cult.GetNrDeadCultists() )
		);
		return {
			round: this.#round,
			attack: this.#attack_nr === 0 ? "No" : this.#attack_nr,
			attacking: this.#attack_cult !== NO_CULT ? this.GetCultName( this.#attack_cult ) : "None",
			funds: this.#trophies_pile.GetNrCards(),
			injuries: this.#dice_row.NrDeadDice() + "/" + MAX_INJURIES,
			blood: this.#blood,
			dead: lst
		};
	}

	UnselectPlanet () {
		
		this.#selected_planet.SetSelected( false );
		this.#selected_planet = null;
	}

	TestAttackPlanet ( card ) {
		

		if ( card.IsSelected() ) {
			
			
			this.UnselectPlanet();
			return;
		}

		const CULT = this.GetCardCultByLocation( card );
		if ( CULT.GetPlanetRound() !== this.#round ) {
			//** Not upon appearence
			if ( this.#planet_protection !== PLANET_PROTECTION_NONE ) {
				if ( this.#planet_protection === PLANET_PROTECTION_ALL && CULT.HasTargets() ) {
					
					return this.#Warn( "Planet is protected by Cultists and/or Horror." );
				}
				if ( this.#planet_protection === PLANET_PROTECTION_HORROR && CULT.HasHorror() ) {
					
					return this.#Warn( "Planet is protected by Horror." );
				}
				if ( this.#planet_protection === PLANET_PROTECTION_CUTISTS && CULT.HasCultists() ) {
					
					return this.#Warn( "Planet is protected by Cultists." );
				}
			}
		}

		if ( ! this.#store.HasAlignmentRequest() ) {
			
			return this.#Warn( "Request an ALIGNMENT CONTROL from the store." );
		}
		
		if ( this.#selected_planet !== null ) {
			
			this.UnselectPlanet();
		}

		
		
		card.SetSelected( true );
		this.#selected_planet = card;
	}

	TestSacrifice ( card ) {
		

		if ( ! this.#store.HasSacrificeRequest() ) {
			
			return this.#Warn( "Request a Sacrifice from the store." );
		}

		const CULT = this.GetCardCultByLocation( card );
		

		const COST = this.#store.GetSacrificeCost( card );
		

		

		const NR_TROPHIES = this.#trophies_pile.GetNrCards();
		var BLOOD_COST = 0;
		if ( COST > NR_TROPHIES ) {
			if ( ! this.#use_blood ) {
				this.#store.ClearSacrifice();
				return this.#Warn(
					"Not enough trophies to sacrifice this Cultist. Needed: " + COST + "."
				);
			}
			BLOOD_COST = this.#store.GetBloodCost( COST, NR_TROPHIES );
			if ( BLOOD_COST > this.#blood ) {
				this.#store.ClearSacrifice();
				return this.#Warn(
					"Not enough trophies and blood to sacrifice this Cultist."
					+ " Needed: " + COST + " or " + COST + " + " + BLOOD_COST + "."
				);
			}
			// this.#blood -= BLOOD_COST;
			// 
		}

		//** OK to proceed

		// 

		return this.Pay(
			COST,
			STORE_SACRIFICE,
			{ card: card, blood_cost: BLOOD_COST, nr_trophies: NR_TROPHIES }
		).then(
			() => {
				this.#blood += card.GetValue();
				this.ApplyStoreItem(
					STORE_SACRIFICE,
					{ card: card, cult: CULT }
				);
			}
		);
	}

	TestPlanetAction ( action ) {
		
		

		
		
		const CULT = this.GetCardCultByLocation( this.#selected_planet );
		
		
		const UPON_APPEARENCE = ( CULT.GetPlanetRound() === this.#round );
		
		
		const COST = this.#store.GetAlignmentCost( action, UPON_APPEARENCE );
		

		

		const NR_TROPHIES = this.#trophies_pile.GetNrCards();
		var BLOOD_COST = 0;
		if ( COST > NR_TROPHIES ) {
			if ( ! this.#use_blood ) {
				this.UnselectPlanet();
				this.#store.ClearAlignment();
				return this.#Warn(
					"Not enough trophies to " + action + " planet."
					+ " Needed: " + COST + "."
				);
			}
			BLOOD_COST = this.#store.GetBloodCost( COST, NR_TROPHIES );
			if ( BLOOD_COST > this.#blood ) {
				this.#store.ClearAlignment();
				return this.#Warn(
					"Not enough trophies and blood to " + action + " planet."
					+ " Needed: " + COST + " or " + COST + " + " + BLOOD_COST + "."
				);
			}
			// this.#blood -= BLOOD_COST;
			// 
		}

		//** OK to proceed

		// 

		// this.#MoveGroupOfCards(
		// 	PAY_ALIGNMENT_TIME_FACTOR,
		// 	COST,
		// 	() => {
		// 		this.#discard_pile.AddCard( this.#trophies_pile.GetCardFromTop() );
		// 	}
		// )
		
		return this.Pay(
			COST,
			STORE_ALIGNMENT,
			{
				action: action === "discard" ? "destroy" : "return",
				suit:  this.#selected_planet.GetSuit(),
				blood_cost: BLOOD_COST,
				nr_trophies: NR_TROPHIES
			}
		).then(
			() => {
				this.ApplyStoreItem(
					STORE_ALIGNMENT,
					{ action: action, cult: CULT }
				);
			}
		);
	}

	Pay ( item_cost, item_code, data = null ) {
		var time_factor;

		
		

		const NR_TROPHIES = data.nr_trophies;
		var txt_cost = "";
		if ( item_cost > NR_TROPHIES ) {
			
			const BLOOD_COST = data.blood_cost;
			
			this.#blood -= BLOOD_COST;
			item_cost = NR_TROPHIES;
			if ( NR_TROPHIES > 0 ) {
				txt_cost = NR_TROPHIES + " trophies and "
			}
			txt_cost += BLOOD_COST + " blood";
		} else {
			txt_cost = item_cost + " trophies";
		}
		txt_cost = "Paying " + txt_cost + " ";
		
		if ( item_code === STORE_SACRIFICE ) {
			time_factor = PAY_SACRICIFE_TIME_FACTOR;
			this.#Warn(
				txt_cost + "to sacrifice "
				+ data.card.GetValue() + " of "
				+ this.GetCultName( data.card.GetSuit() )
				+ "."
			);
		} else if ( item_code === STORE_ALIGNMENT ) {
			time_factor = PAY_ALIGNMENT_TIME_FACTOR;
			this.#Warn(
				txt_cost + "to "
				+ data.action + " Planet of "
				+ this.GetCultName( data.suit )
				+ "."
			);
		} else {
			time_factor = PAY_TROPHY_TIME_FACTOR;
			this.#Warn(
				txt_cost + "for store item: "
				+ this.#store.GetItemName( item_code )
				+ "."
			);
		}

		return this.#MoveGroupOfCards(
			time_factor,
			item_cost,
			() => {
				this.#discard_pile.AddCard( this.#trophies_pile.GetCardFromTop() );
			}
		);
	}

	ApplyStoreItem ( item_code, data = null ) {
		

		if ( item_code === STORE_DIE ) {
			//** Add 1 die to your combat pool for a single combat
			const DIE = this.#dice_row.AddTempDie();
			
			if ( this.#round_phase === PHASE_ATTACK ) {
				DIE.SetUsed( false );
				DIE.Roll().then(
					value => {
						this.#store.Show();
						DIE.SetReroll( value !== 1 );
						this.ProcessRolledDice( false ); //** false: Signal reroll
					}
				);
			} else {
				DIE.SetUsed( true );
			}

			return DIE;
		}
		
		if ( item_code === STORE_SHIFT ) {
			//** Play target an additional cult in combat in a single turn
			if ( this.#attack_cult !== NO_CULT ) {
				this.#lst_cults[ this.#attack_cult ].SetUnderAttack( false );
			}
			this.#attack_cult = NO_CULT;
			this.#attack_nr = 0;
			this.#dice_row.RemoveTempDies();
			this.#store.Show();
			return this.ResetAndRollDice().then(
				() => {
					
				}
			);
		}

		if ( item_code === STORE_LUCK ) {
			//** Reroll any dice in combat, even 1s
			this.#store.AddReroll();
			return null;
		}

		if ( item_code === STORE_FLESH ) {
			//** Recover 1 die lost to injury
			const DIE = this.#dice_row.ReviveDie();
			if ( this.#round_phase === PHASE_ATTACK ) {
				DIE.SetUsed( false );
				DIE.Roll().then(
					value => {
						this.#store.Show();
						DIE.SetReroll( value !== 1 );
						this.ProcessRolledDice( false ); //** false: Signal reroll
					}
				);
			} else {
				DIE.SetUsed( true );
			}
			return DIE;
		}

		if ( item_code === STORE_ARTIFACT ) {
			//** Permanently add 1 die to your pool.
			//** Cannot be done during combat.
			//** There is no limit on pool size.
			return this.#dice_row.AddNewDie().SetUsed( true );
		}

		if ( item_code === STORE_ALIGNMENT ) {
			//** Return or destroy an Alignment card
			const CARD = this.#selected_planet;
			data.cult.RemoveCard( CARD );
			this.UnselectPlanet();
			this.#store.UseAlignment();

			if ( data.action === "reshuffle" ) {
				this.#MoveGroupOfCards(
					ONE_CARD_TIME_FACTOR,
					1,
					() => {
						this.#draw_pile.AddCard( CARD );
					}
				).then(
					() => {
						this.#draw_pile.ShuffleCards();
					}
				);
			} else if ( data.action === "discard" ) {
				this.#MoveGroupOfCards(
					ONE_CARD_TIME_FACTOR,
					1,
					() => {
						this.#discard_pile.AddCard( CARD );
					}
				);
			}

			return CARD;
		}

		if ( item_code === STORE_SACRIFICE ) {
			//** Slay Cultist (from any cult)
			this.#store.UseSacrifice();
			this.#defeated_targets = true;
			
			this.#MoveGroupOfCards(
				ONE_CARD_TIME_FACTOR,
				1,
				() => {
					data.cult.RemoveCard( data.card );
					this.#discard_pile.AddCard( data.card );  //** Not a trophy!
					this.#store.Show();
				}
			);
			
			return data.card;
		}
	}

	Help () {
		if ( this.#lst_cards_out === null ) {
			return;
		}

		console.debug( "Help >> Round:", this.#round );

		var lst = Array( [], [], [], [] );

		this.#lst_cards_out.forEach(
			card => lst[ card.GetSuit() ].push( card.GetValue() )
		);

		var cult_id = 0;
		lst.forEach(
			lst_cards => {
				var str = this.GetCultName( cult_id ++ )[ 0 ];
				str += " = ";
				var cultist = false;
				lst_cards.sort( (a,b)=>b-a);
				lst_cards.forEach(
					n => {
						if ( n === ROYAL_ACE ) {
							str += n + " |";
						} else if ( n <= 10 ) {
							if ( ! cultist ) {
								cultist = true;
								str += " |";
							}
							str += " " + n ;
						} else {
							str += " " + n ;
						}
					}
				)
				console.debug( str );
			}
		);

	}

}

//** EOF//** File: c_CardPile.js

"use strict;"

class CardPile extends FlexBox {
	#id = null;
	#lst_cards = [];
	#delay = 0;
	#top_card_face = false;
	#base = null;
	#e_counter = null;

	constructor ( id ) {
		super( id, "column", "center", "center", true );

		this.#id = id;

		this.#base = new FlexBoxEntity( this.#id + "_Base", true );
		this.AddEntity( this.#base );

		const E_BASE = this.#base.GetElement();
		E_BASE.classList.add( "CardPileBase" );
		E_BASE.classList.add( "Clickable" );

		this.#e_counter = document.createElement( "p" );
		this.#e_counter.classList.add( "Hidden" );
		E_BASE.appendChild( this.#e_counter );
	}

	GetBaseElement () {
		return this.#base.GetElement();
	}

	GetCards () {
		return CloneArray( this.#lst_cards );
	}

	SetTopCardFace ( status ) {
		this.#top_card_face = status;
		if ( this.#lst_cards.length > 0 ) {
			this.#lst_cards[ this.#lst_cards.length - 1 ].SetFaceUp( status );
		}
	}
	
	// onResize ( width, height, top, left, card_width, card_height ) {
	// 	super.onResize( width, height, top, left );
		
	// }

	UpdateEntities ( card_width, card_height ) {
		//** Base size && position
		this.SetEntitiesSize( card_width, card_height );
		this.SetEntitiesPosition();
		//** Cards position = base position
		this.#SetCardsPosition();
		this.#e_counter.style.fontSize = Math.round( card_width * 0.12 ) + "px";
	}

	#SetCardsPosition () {
		const [ TOP, LEFT ] = this.#base.GetPosition();
		this.#lst_cards.forEach(
			card => card.SetPosition( TOP, LEFT )
		);
	}

	SetCardsIndex () {
		var z = 1;
		this.#lst_cards.forEach(
			card => card.SetZindex( z ++ )
		);
	}

	SetDelay ( value ) {
		this.#delay = value;
	}
	
	AddCardToTop ( card ) {
		this.AddCard( card, true );
	}
	
	AddCardToBottom ( card ) {
		this.AddCard( card, false );
	}
	
	AddCard ( card, to_top = true ) {
		

		if ( this.#lst_cards.includes( card) ) {
			return 
		}

		this.#lst_cards[ to_top ? "push" : "unshift" ]( card );
		
		
		const [ TOP, LEFT ] = this.#base.GetPosition();
		card.SetSelected( false );
		card.SetFaceUp( false );
		card.SetPosition( TOP, LEFT );
		if ( to_top ) {
			card.SetZindex( 100 + this.#lst_cards.length );
		} else {
			card.SetZindex( 0 );
		}
		card.SetLocation( this );

		Delay( this.#delay ).then(
			_ => {
				this.#e_counter.innerHTML = this.#lst_cards.length;
				this.SetCardsIndex();
				this.HideAllButTopCard();
			}
		);
	}

	GetBasePosition () {
		return this.#base.GetPosition();
	}

	GetCardFromTop () {
		if ( this.#lst_cards.length === 0 ) {
			
			return null;
		}

		const CARD = this.#lst_cards.pop();
		CARD.SetZindex( 100 + this.#lst_cards.length );
		CARD.SetHidden( false );
		this.HideAllButTopCard();
		this.#e_counter.innerHTML = this.#lst_cards.length;

		return CARD;
	}

	HideAllButTopCard () {
		var idx = this.#lst_cards.length - 1;

		if ( idx >= 0 ) {
			//** Top card
			var card = this.#lst_cards[ idx ];
			card.SetHidden( false );
			card.SetFaceUp( this.#top_card_face );

			//** All other cards
			for ( -- idx; idx >= 0; -- idx ) {
				card = this.#lst_cards[ idx ];
				card.SetHidden( true );
				card.SetFaceUp( false );
			}
		}
	}

	// _TopCard() {
	// 	return this.#lst_cards[ this.#lst_cards.length - 1 ];
	// }

	IsEmpty () {
		return ( this.#lst_cards.length === 0 );
	}
	
	GetNrCards () {
		return this.#lst_cards.length;
	}

	RemoveCard ( card ) {
		

		if ( ! this.#lst_cards.includes( card) ) {
			return 
		}

		RemoveArrayElement( this.#lst_cards, card );
		card.SetHidden( false );
		this.#e_counter.innerHTML = this.#lst_cards.length;
		this.HideAllButTopCard();

		return card;
	}

	ShowCounter ( status ) {
		this.#e_counter.classList[ status ? "remove" : "add" ]( "Hidden" );
		if ( status ) {
			this.#e_counter.innerHTML = this.#lst_cards.length;
		}
	}

	SendCardsToPile ( card_pile ) {
		

		var card;
		while ( this.#lst_cards.length > 0 ) {
			card = this.#lst_cards[ 0 ];
			this.RemoveCard( card );
			card_pile.AddCard( card );
		}
	}

	GetClickTarget () {
		return this.#base.GetElement();
	}

	// ClearCards () {
	// 	var lst_cards = [];

	// 	while ( this.#lst_cards.length > 0 ) {
	// 		lst_cards.push( this.GetCardFromTop() );
	// 	}

	// 	return lst_cards;
	// }

	ShuffleCards () {
		if ( this.#lst_cards.length > 1 ) {
			ShuffleArray( this.#lst_cards );
			this.SetCardsIndex();
			this.HideAllButTopCard();
		}
	}

	Highlight ( status ) {
		this.GetElement().classList[ status ? "add" : "remove" ]( "Highlight" );
	}

}

//** EOF//** File: c_CardsRow.js

"use strict;"

class CardsRow extends FlexBox {
	#id = null;
	#max_cards = 0;
	// #is_hand = false;
	#lst_cards = [];
	#add_face_up = true;
	
	constructor ( id, max_cards, clickable = false ) {
		super( id, "row", "evenly", "center", true );

		this.#id = id;
		// this.#is_hand = is_hand;
		this.#max_cards = max_cards;

		if ( clickable && this.GetElement() !== null ) {
			this.GetElement().classList.add( "Clickable" );
		}
	}

	SetAddFaceUp ( status ) {
		this.#add_face_up = status;
	}

	AddCard ( card, to_end = true ) {
		

		if ( this.#lst_cards.length === this.#max_cards ) {
			return 
		}
		if ( this.#lst_cards.includes( card) ) {
			return 
		}

		card.SetLocation( this );
		card.SetFaceUp( this.#add_face_up );
		card.SetZindex( 100 + this.#lst_cards.length );

		if ( to_end ) {
			this.#lst_cards.push( card );
		} else {
			this.#lst_cards.unshift( card );
		}
		
		this.AddEntity( card, to_end );

		return card;
	}

	RemoveCard ( card ) {
		

		if ( ! this.#lst_cards.includes( card ) ) {
			return 
		}
		
		RemoveArrayElement( this.#lst_cards, card );
		this.RemoveEntity( card );
		card.ClearLocation();

		return card;
	}

	ClearCards ( card_pile ) {
		
		
		var card;
		while ( this.#lst_cards.length > 0 ) {
			card = this.#lst_cards[ 0 ];
			this.RemoveCard( card );
			card_pile.AddCard( card );
		}
	}

	GetFilteredCards ( fn ) {
		return this.#lst_cards.filter( fn );
	}

	GetSelectedCards () {
		// 

		return this.#lst_cards.filter(
			card => card.IsSelected()
		);
	}

	UnselectSelectedCards () {
		this.#lst_cards.filter(
			card => card.IsSelected()
		).forEach(
			card => card.SetSelected( false )
		);
	}

	GetNrCards () {
		return this.#lst_cards.length;
	}

	GetCards () {
		return CloneArray( this.#lst_cards );
	}

	IsFirstCard ( card ) {
		

		if ( this.#lst_cards.length === 0 ) {
			return false;
		}

		return ( this.#lst_cards[ 0 ] === card );
	}

	PeekFirstCard () {
		if ( this.#lst_cards.length === 0 ) {
			
			return null;
		}

		return this.#lst_cards[ 0 ];
	}

	GetFirstCard () {
		if ( this.#lst_cards.length === 0 ) {
			
			return null;
		}

		return this.RemoveCard( this.#lst_cards[ 0 ] );
	}

	IsEmpty () {
		return ( this.#lst_cards.length === 0 );
	}

	
	IsFull () {
		return ( this.#lst_cards.length === this.#max_cards );
	}
}

//** EOF//** File: c_Deck.js

"use strict;"

class Deck {
	#lst_cards = [];
	#lst_cards_out = [];
	#nr_jokers = 0;
	#total_cards = 0;
	
	constructor ( nr_jokers, discard_fn = null ) {
		this.#nr_jokers = nr_jokers;

		this.#MakeCards();

		if ( discard_fn !== null ) {
			this.DiscardCards ( discard_fn );
		}
	}

	#MakeCards () {
		var card, id = 0;
		const LST_COLORS = [];
		
		//** Add cards 2 to 14
		var suit, value, color;
		for ( suit = 0; suit < 4; ++ suit ) {
			color = this.GetSuitColor( suit );
			if ( ! LST_COLORS.includes( color ) ) {
				LST_COLORS.push( color );
			}
			for ( value = 2; value <= 14; ++ value ) {
				card = new Card(
					id ++,
					//** suit:	{ id, symbol, color }
					{ id: suit, symbol: this.GetSuitSymbol( suit ), color: color },
					//** value: { nr, symbol }
					{ nr: value, symbol: this.GetValueSymbol( value ) }
					);
					this.#lst_cards.push( card );
					this.#total_cards += 1;
					// 
			}
		}
			
		//** Add JOKERS
		var idx_color = 0, n;
		for ( n = 1; n <= this.#nr_jokers; ++ n ) {
			card = new Card(
				id ++,
				//** suit:	{ id, symbol, color }
				{ id: SUIT_JOKER, symbol: this.GetSuitSymbol( SUIT_JOKER ), color: LST_COLORS[ idx_color ] },
				//** value: { nr, symbol }
				{ nr: ROYAL_JOKER, symbol: this.GetValueSymbol( ROYAL_JOKER ) }
			);
			
			this.#lst_cards.push( card );
			this.#total_cards += 1;

			idx_color = ( 1 + idx_color ) % LST_COLORS.length;
		}
	}

	DiscardCards ( fn ) {
		if ( this.#lst_cards_out.length > 0 ) {
			
			return;
		}

		const lst_cards = this.#lst_cards.filter( fn );

		

		this.#total_cards -= lst_cards.length;
		
		lst_cards.forEach(
			card => {
				RemoveArrayElement( this.#lst_cards, card );
			}
		)

		

		return lst_cards;
	}

	onResize ( card_width, card_height ) {
		this.ForEachCard( card => card.SetSize( card_width, card_height ) );
	}

	ForEachCard ( fn ) {
		this.#lst_cards.forEach( fn );
		this.#lst_cards_out.forEach( fn );
	}

	Shuffle () {
		ShuffleArray( this.#lst_cards );
	}

	GetCard () {
		if ( this.#lst_cards.length === 0 ) {
			return null;
		}

		const CARD = RemoveRandomElement( this.#lst_cards );
		this.#lst_cards_out.push( CARD );
		
		return CARD;
	}

	Reset () {
		while ( this.#lst_cards_out.length ) {
			this.#lst_cards.push( this.#lst_cards_out.pop() );
		}

		this.#lst_cards.forEach( card => card.Reset() );

		
	}

	GetSuitSymbol ( suit ) {
		return LST_SUITS.filter( data => data.id === suit ).pop().symbol;
	}
	
	GetSuitColor ( suit ) {
		return LST_SUITS.filter( data => data.id === suit ).pop().color;
	}
	
	GetValueSymbol ( value ) {
		if ( value === ROYAL_JOKER || 11 <= value && value <= 13 || value === ROYAL_ACE ) {
			return LST_ROYALS.filter( data => data.value === value ).pop().symbol;
		}
		return value;
	}

	SetCardsSize ( card_width, card_height ) {
		this.ForEachCard(
			card => card.SetSize( card_width, card_height )
		);
	}

	GetFilteredCards ( fn ) {
		const lst_cards = this.#lst_cards.filter( fn );
		
		lst_cards.forEach(
			card => {
				RemoveArrayElement( this.#lst_cards, card );
				this.#lst_cards_out.push( card );
			}
		)

		return lst_cards;
	}

	GetNrCards () {
		return this.#lst_cards.length;
	}

	GetNrTotalCards () {
		return this.#total_cards;
	}

	GetRemainingCards () {
		const lst_cards = [];
		var card;

		while ( this.#lst_cards.length > 0 ) {
			var card = this.#lst_cards.pop();
			this.#lst_cards_out.push( card );
			lst_cards.push( card );
		}

		return lst_cards;
	}
	
	// AllCardsMatch ( lst_cards, fn ) {
	// 	var ok = true;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( ! fn( card ) ) {
	// 				ok = false;
	// 			}
	// 		}
	// 	);

	// 	return ok;
	// }

	// AnyCardMatches ( lst_cards, fn ) {
	// 	var ok = false;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( fn( card ) ) {
	// 				ok = true;
	// 			}
	// 		}
	// 	);

	// 	return ok;
	// }

	// GetSequenceValue ( lst_cards, sequence_suit = null ) {
	// 	if ( lst_cards.length === 0 ) {
	// 		return NaN;
	// 	}

	// 	if ( sequence_suit === null ) {
	// 		sequence_suit = this.GetSequenceSuit( lst_cards );
	// 	}
	// 	// 
	// 	if ( sequence_suit === null ) {
	// 		return NaN;
	// 	}

	// 	var nr_jokers = 0, sum_value = 0, max_value = 0;
		
	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( card.IsJoker() ) {
	// 				nr_jokers += 1;
	// 			} else {
	// 				let card_value = card.GetValue();
	// 				sum_value += card_value;
	// 				if ( card_value > max_value ) {
	// 					max_value = card_value;
	// 				}
	// 			}
	// 		}
	// 	);

	// 	if ( nr_jokers > 0 ) {
	// 		sum_value += nr_jokers * max_value;
	// 	}

	// 	// 

	// 	return sum_value;
	// }

	// GetSequenceSuit ( lst_cards ) {
	// 	if ( lst_cards.length === 0 ) {
	// 		return null;
	// 	}

	// 	var suit = null, ok = true;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( ! card.IsJoker() ) {
	// 				if ( suit === null ) {
	// 					suit = card.GetSuit();
	// 				}
	// 				if ( suit !== null && card.GetSuit() !== suit ) {
	// 					ok = false;
	// 				}
	// 			}
	// 		}
	// 	);

	// 	return ( ok ? suit : null );
	// }

}

//** EOF//** File: c_Menu.js

class Menu {
    #element = null;
    #icon = null;
	#lst_elements =null;

    constructor  ( element, icon ) {
        this.#element = element;
        this.#icon = icon;

		this.#lst_elements = Array.from( element.children );
		
		this.#icon.classList.add( "Clickable" );

		this.#lst_elements.forEach(
			e => e.classList.add( "Clickable" )
		);
    }

	GetElements () {
		return CloneArray( this.#lst_elements );
	}

    Show () {
		this.#element.style.right = 0;
	}
    
	Hide () {
		this.#element.style.right = ( -1.1 * this.#element.offsetWidth ) + "px"
	}
    
	Toggle () {
		// 
		this.#element.style.right === "0px"
			? this.Hide()
			: this.Show();
	}

	ShowIcon ( status = true ) {
		this.#icon.classList[ status ? "remove" : "add" ]( "Hidden" );
	}

	IsIcon( e ) {
		return e.id.startsWith( "Menu" );
	}
	
	EnablePlay ( status ) {
		eById( "Menu_Play" ).classList[ status ? "remove" : "add" ]( "Hidden" );
	}

}

//** EOF//** File: c_Messenger.js

"use strict;"

class Messenger {
	#element = null;
	#e_txt = null;
	#e_OK = null;
	#show_time = 0;
	#timer = 0;
	#alert = false;
	
	constructor ( show_time ) {
		this.#element = document.createElement( "div" );
		this.#element.id = "Messenger";
		this.#e_txt = document.createElement( "p" );
		this.#element.appendChild( this.#e_txt );
		this.#e_OK = document.createElement( "div" );
		this.#e_OK.classList.add( "Clickable" );
		this.#e_OK.classList.add( "Hidden" );
		this.#element.appendChild( this.#e_OK );

		this.#show_time = ( show_time < 1E3 ? 1E3 * show_time : show_time );
	}

	// SetShowTime ( value ) {
	// 	this.#show_time = value;
	// }

	GetElement () {
		return this.#element;
	}

	GetClickTarget () {
		return this.#e_OK;
	}

	onResize ( width, height, top, left ) {
		this.#element.style.width = width + "px";
		this.#element.style.height = height + "px";
		this.#element.style.left = left + "px";
		
		this.#e_txt.style.fontSize = Math.min(
			Math.round( height * 0.25 ),
			17
		) + "px";

		this.Hide();
	}

	Hide () {
		if ( this.#alert ) {
			
		}
		
		this.#element.style.top = ( - 1.1 * this.#element.offsetHeight ) + "px";
		
		if ( this.#alert ) {
			this.#alert = false;
			setTimeout(
				() => { this.#e_OK.classList.add( "Hidden" ) },
				500 //** Transition time
			);
		}
	}
	
	ShowPrefixMessage ( prefix, message ) {
		if ( this.#show_time > 0 ) {
			this.ShowMessage( "<span>" + prefix + "</span>: " + message );
		}
	}

	ShowMessage ( message ) {
		if ( this.#alert ) {
			
			
			return;
		}

		if ( this.#show_time > 0 ) {
			clearTimeout( this.#timer );
			this.#timer = setTimeout( this.Hide.bind( this ), this.#show_time );
			this.#e_txt.innerHTML = message;
			this.#element.style.top = 0;
		}
	}
	
	ShowForever ( message ) {
		clearTimeout( this.#timer );
		this.#e_txt.innerHTML = message;
		this.#element.style.top = 0;
	}

	Alert ( message ) {
		clearTimeout( this.#timer );
		this.#alert = true;
		this.#e_OK.classList.remove( "Hidden" );
		this.ShowForever( message );
	}
	
	ClearAlert () {
		if ( this.#alert ) {
			this.#alert = false;
			this.#e_OK.classList.add( "Hidden" );
			this.Hide();
		}
	}

}

//** EOF//** File: c_PilesRow.js

"use strict;"

class PilesRow extends FlexBox {
	// #id = null;
	#draw = null;
	#discard = null;
	#trophies = null;
	
	constructor () {
		super( "PilesRow", "column", "evenly", "center", true );

		// this.#id = id;
		this.#draw = new CardPile( "Draw" );
		this.#discard = new CardPile( "Discard" );
		this.#trophies = new CardPile( "Trophies" );

		this.#draw.ShowCounter( true );
		this.#discard.ShowCounter( true );
		this.#trophies.ShowCounter( true );

		this.AddEntity( this.#draw );
		this.AddEntity( this.#discard );
		this.AddEntity( this.#trophies );
	}

	onResize ( width, height, top, left, card_width, card_height ) {
		super.onResize( width, height, top, left );
		
		//** Entities: draw && discard && trophies piles
		// this.SetEntitiesSize( card_width, card_height );
		this.SetEntitiesSize( width, height / 3 );
		this.SetEntitiesPosition();

		this.ForEachEntity(
			e => {
				if ( e instanceof CardPile ) {
					e.UpdateEntities( card_width, card_height );
				}
				// else {
				// 	
				// 	e.GetElement().style.fontSize = Math.round( card_width * 0.12 ) + "px";
				// }
			}
		);
	}

	GetDrawPile () {
		return this.#draw;
	}

	GetDiscardPile () {
		return this.#discard;
	}

	GetTrophiesPile () {
		return this.#trophies;
	}

	GetElements () {
		return [
			this.GetElement(),
			this.#draw.GetElement(),
			this.#discard.GetElement(),
			this.#trophies.GetElement(),
			this.#draw.GetBaseElement(),
			this.#discard.GetBaseElement(),
			this.#trophies.GetBaseElement()
		];
	}

}

//** EOF//** File: c_Stats.js

class Stats {
    #element = null;

    #score = 0;
	#nr_captures = 0;
	#value_captures = 0;

    constructor  ( element ) {
        this.#element = element;
    }

    Reset () {
        this.#score = 0;
        this.#nr_captures = 0;
        this.#value_captures = 0;

        this.#UpdateInfo();
    }

    // GetElement () {
	// 	return this.#element;
	// }

    // onResize ( width, height, top, left ) {
	// }

    Update ( action_id, enemy_card, lst_hand_cards ) {
        if ( action_id === "cec" ) {
            this.#score += enemy_card.GetValue();
            if ( enemy_card.IsRoyalOrAce() ) {
                this.#nr_captures += 1;
                this.#value_captures += enemy_card.GetValue();
            }
        } else if ( action_id === "ecc" || action_id === "stc" ) {
            lst_hand_cards.forEach(
                card => this.#score -= card.GetValue()
            );
        }

        this.#UpdateInfo();
    }

    #UpdateInfo () {
        eById( "txt_score" ).innerHTML = this.#score;
        eById( "txt_nr_captures" ).innerHTML = this.#nr_captures;
        eById( "txt_percent_captures" ).innerHTML = Math.round(
            this.#value_captures / MAX_CAPTURES_VALUE * 100
        );
    }

    GetScore () {
        return this.#score;
    }
}

//** EOF//** File: c_Store.js

"use strict;"

const STORE_NO_FUNDS = -1;
const STORE_OK = 0;
const STORE_DIE = 1;
const STORE_LUCK = 2;
const STORE_SHIFT = 3;
const STORE_FLESH = 4;
const STORE_ARTIFACT = 5;
const STORE_ALIGNMENT = 6;
const STORE_SACRIFICE = 7;

const STORE_ITEMS = [
	{ id: "sacrifice", txt: "Sacrifice", cost: "cultist", code: STORE_SACRIFICE },
	{ id: "alignment_control", txt: "Alignment Control", cost: "R=2/4 D=5/10", code: STORE_ALIGNMENT },
	{ id: "spirit_die", txt: "Spirit Die", cost: 2, code: STORE_DIE },
	{ id: "devils_luck", txt: "Devil's Luck", cost: 3, code: STORE_LUCK },
	{ id: "time_shift", txt: "Time Shift", cost: 5, code: STORE_SHIFT },
	{ id: "grow_flesh", txt: "Grow Flesh", cost: 5, code: STORE_FLESH },
	{ id: "buy_artifact", txt: "Buy Artifact", cost: 10, code: STORE_ARTIFACT }
];


class Store {
	#id = null;
	#element = null;
	#header = null;
	#visible = true;
	#reroll_available = 0;
	#fn_update = null;
	#requested_alignment = false;
	#requested_sacrifice = false;
	#use_blood = 0;
	
	constructor ( element, fnUpdate, use_blood ) {
		this.#element = element;
		this.#id = element.id;
		this.#fn_update = fnUpdate;
		this.#use_blood = use_blood;

		this.MakeItems();

		
	}

	GetItemName ( item_code ) {
		const ITEM = this.#GetItemByCode( item_code );
		return ITEM.txt.toUpperCase();
	}

	onResize ( width,  height, left ) {
		this.#element.style.width = width + "px";
		this.#element.style.height = height + "px";
		this.#element.style.left = left + "px";
		this.#element.style.fontSize = Math.round( width * 15E-3 ) + "px";
	}

	MakeItems () {
		this.#header = document.createElement( "header" );
		this.#element.appendChild( this.#header );

		const lst = [
			{ id: "round", txt: "Round" },
			{ id: "attack*", txt: "Attack" },
			{ id: "injuries", txt: "Injuries" },
			{ id: "info", txt: "Info" }
		];

		if ( this.#use_blood ) {
			lst.push( { id: "blood", txt: "Blood" } );
		}

		for ( var data of lst ) {
			var e = document.createElement( "span" );
			e.innerHTML = data.txt + ":";
			this.#header.appendChild( e );
			e = document.createElement( "span" );
			e.id = "store_" + data.id
			e.classList.add( "StoreInfo" );
			this.#header.appendChild( e );
		}

		var idx = 0;
		STORE_ITEMS.forEach(
			item => {
				const e = document.createElement( "div" );
				e.id = item.id;
				e.dataset.idx = idx ++;
				e.classList.add( "Clickable" );
				
				for ( var key of [ "txt", "cost" ] ) {
					var p = document.createElement( key === "txt" ? "p" : "span" );
					p.innerHTML = item[ key ];
					e.appendChild( p );
				}

				this.#element.appendChild( e );
			}
		);
	}

	#UpdateInfo () {
		const data = this.#fn_update();

		for ( var k in data ) {
			var e = eById( "store_" + k );
			if ( e !== null ) {
				e.innerHTML = data[ k ];
			}
		}

		// eById( "store_sacrifice" ).innerHTML = ( this.#requested_sacrifice ? "Yes" : "No" );
		// eById( "store_alignment" ).innerHTML = ( this.#requested_alignment ? "Yes" : "No" );
		// eById( "store_reroll" ).innerHTML = this.#reroll_available;
		eById( "store_attack*" ).innerHTML = data.attack + "/" + data.attacking;
		eById( "store_info" ).innerHTML = data.dead.join( " " );

		return data.funds;
	}

	GetClickTargets () {
		return Array.from( aByTag( "div", this.#element ) );
	}
	
	Show () {
		this.#visible = true;
		this.#element.style.bottom = "";

		const funds = this.#UpdateInfo();

		STORE_ITEMS.forEach(
			item => {
				if ( typeof item.cost === "number") {
					const e = eByTag( "span", eById( item.id ) );
					const ok = ( item.cost <= funds );
					e.classList[ ok ? "remove" : "add" ]( "NoFunds" );
				}
			}
		);
	}
	
	Hide () {
		this.#visible = false;
		this.#element.style.bottom = ( - this.#element.offsetHeight ) + "px";
	}

	Toggle () {
		if ( this.#visible ) {
			this.Hide();
		} else {
			this.Show();
		}
	}

	TestItem ( e_item, funds, blood ) {
		const item = STORE_ITEMS[ e_item.dataset.idx ];

		
		
		
		
		
		
		if ( typeof item.cost === "number") {
			const diff = Math.max( 0, item.cost - funds );
			
			const BLOOD_COST = Math.round( Math.pow( this.#use_blood, diff ) );
			
			
			var STATUS;
			if ( this.#use_blood ) {
				STATUS = BLOOD_COST <= blood;
			} else {
				STATUS = item.cost <= funds;
				// diff = 0;
			}
			

			return {
				status: ( STATUS ? STORE_OK : STORE_NO_FUNDS ),
				item_code: item.code,
				item_cost: item.cost,
				blood_cost: BLOOD_COST,
				trophies_cost: item.cost - diff
			};
		}

		if ( item.code === STORE_ALIGNMENT ) {
			this.#requested_alignment = true;
			return { status: STORE_OK, item_code: STORE_ALIGNMENT };
		}
		if ( item.code === STORE_SACRIFICE ) {
			this.#requested_sacrifice = true;
			return { status: STORE_OK, item_code: STORE_SACRIFICE };
		}

		return null;
	}

	GetBloodCost ( item_cost, nr_trophies ) {
		return Math.pow( 2, Math.max( 0, item_cost - nr_trophies ) );
	}

	GetSacrificeCost ( card ) {
		return card.GetValue();
	}

	GetAlignmentCost ( action, upon_appearence ) {
		var cost = ( action === "reshuffle" ? 2 : 5 );

		if ( ! upon_appearence ) {
			cost *= 2;
		}

		return cost;
	}

	#GetItemByCode ( code ) {
		const lst = STORE_ITEMS.filter( item => item.code === code );
		
		if ( lst.length !== 1 ) {
			return null;
		}

		return lst.pop();
	}

	GetItemCost ( code ) {
		const item = this.#GetItemByCode( code );
		
		if ( item !== null) {
			return item.cost;
		}

		return NaN;
	}

	// GetItemText ( code ) {
	// 	const item = this.#GetItemByCode( code );
		
	// 	if ( item !== null) {
	// 		return item.txt;
	// 	}

	// 	return null;
	// }

	AddReroll ( n = 1 ) {
		this.#reroll_available += n;
	}
	
	IsRerollAvailable () {
		return ( this.#reroll_available > 0 );
	}
	
	HasAlignmentRequest () {
		return this.#requested_alignment;
	}
	
	HasSacrificeRequest () {
		return this.#requested_sacrifice;
	}

	UseReroll () {
		if ( this.#reroll_available === 0 ) {
			return;
		}

		this.#reroll_available -= 1;
		this.Show();
	}

	ClearSacrifice () {
		this.#requested_sacrifice = false;
	}

	UseSacrifice () {
		if ( ! this.#requested_sacrifice ) {
			return;
		}

		this.#requested_sacrifice = false;
	}

	ClearAlignment () {
		this.#requested_alignment = false;
	}

	UseAlignment () {
		if ( ! this.#requested_alignment ) {
			return;
		}

		this.#requested_alignment = false;
	}

}

//** EOF//** File: c_Cult.js

"use strict;"

class Cult extends FlexBox {
	#id = null;

	#element = null;
	#planet = null;
	#horror = null;
	#cultists = null;
	#planet_round = 0;
	#under_attack = false; //** Not usefull
	#dead_cultists = 0;
	
	constructor ( id ) {
		super( "Cult_" + id, "row", "start", "center", true );

		this.#id = id;

		this.#element = this.GetElement();
		this.#element.classList.add( "Cult" );
		this.#element.classList.add( "Cult_" + id );

		this.#planet = new CardsRow( "Planet_" + id, 1 );
		this.#horror = new CardsRow( "Horror_" + id, 1 );
		this.#cultists = new CardsRow( "Cultists_" + id, EXTRA_CULTISTS + MAX_CULTISTS );
		// this.#cultists.SetJustify( "start" );
		this.#cultists.SetSortEntities(
			( c1, c2 ) => c2.GetValue() - c1.GetValue()
		);
		
		this.#planet.GetElement().classList.add( "Planet" );
		this.#horror.GetElement().classList.add( "Horror" );
		this.#cultists.GetElement().classList.add( "Cultists" );

		this.AddEntity( this.#planet );
		this.AddEntity( this.#horror );
		this.AddEntity( this.#cultists );
	}

	GetId () {
		return this.#id;
	}

	onResize ( width, height, top, left, cell_width ) {
		// 

		this.#planet.SetSize( cell_width, height );
		this.#horror.SetSize( cell_width, height );
		this.#cultists.SetSize( width - 2 * cell_width, height );

		super.onResize( width, height, top, left );

		[ this.#planet, this.#horror, this.#cultists ].forEach(
			card_row => card_row.SetEntitiesPosition()
		);
	}

	GetElements () {
		return [
			this.#element,
			this.#planet.GetElement(),
			this.#horror.GetElement(),
			this.#cultists.GetElement()
		];
	}

	GetPlanet () {
		return this.#planet;
	}

	GetHorror () {
		return this.#horror;
	}

	GetCultists () {
		return this.#cultists;
	}
	
	HasCultists () {
		return this.#cultists.GetNrCards() > 0;
	}
	
	HasMaxCultists () {
		return this.#cultists.GetNrCards() >= MAX_CULTISTS;
	}
	
	GetNrCultists () {
		return this.#cultists.GetNrCards();
	}

	SelectCultists ( status ) {
		this.#cultists.GetCards().forEach( card => card.SetSelected( status ) );
	}

	GetPlanetRound () {
		return this.#planet_round;
	}

	ClearCards ( card_pile ) {
		this.#planet.ClearCards( card_pile );
		this.#horror.ClearCards( card_pile );
		this.#cultists.ClearCards( card_pile );
	}

	AddCultist ( card ) {
		
		
		
		this.#cultists.AddCard( card );

		this.#TestMaxCultists();
		
		return card;
	}

	Reset () {
		this.#cultists.GetElement().classList.remove( "MaxCultists" );
		this.#dead_cultists = 0;
	}

	#TestMaxCultists () {
		const E = this.#cultists.GetElement();
		if ( this.HasMaxCultists() ) {
			E.classList.add( "MaxCultists" );
		} else {
			E.classList.remove( "MaxCultists" );
		}
	}
	
	AddHorror ( card ) {
		
		
		
		return this.#horror.AddCard( card );
	}

	AddPlanet ( card, round ) {
		
		
		this.#planet.AddCard( card );
		this.#planet_round = round;
		card.SetMarker( true );
	}

	ClearPlanetMarker () {
		if ( this.#planet.GetNrCards() > 0 ) {
			this.#planet.PeekFirstCard().SetMarker( false );
		}
	}

	RemoveCard ( card ) {
		
		

		if ( card.IsAt( this.#cultists) ) {
			
			this.#RemoveCultist( card );
		} else if ( card.IsAt( this.#horror ) ) {
			
			this.#RemoveHorror( card );
		} else if ( card.IsAt( this.#planet ) ) {
			
			this.#RemovePlanet( card );
		} else {
			
		}

		return card;
	}

	#RemoveCultist ( card ) {
		
		
		
		this.#cultists.RemoveCard( card );
		this.#TestMaxCultists();
		this.#dead_cultists += 1;
		return card;
	}

	#RemovePlanet () {
		if ( ! this.#planet.IsEmpty() ) {
			this.#planet_round = 0;
			return this.#planet.GetFirstCard();
		}

		return null;
	}

	#RemoveHorror () {
		if ( ! this.#horror.IsEmpty() ) {
			return this.#horror.GetFirstCard();
		}

		return null;
	}

	HasPlanet () {
		return this.#planet.GetNrCards() > 0;
	}

	HasHorror () {
		return this.#horror.GetNrCards() > 0;
	}

	HasTargets () {
		return this.HasHorror() || this.HasCultists();
	}

	PeekHorror () {
		return this.#horror.PeekFirstCard();
	}

	SetUnderAttack ( status ) {
		this.#under_attack = status;

		function SetAttack( entity, status ) {
			entity.GetElement().classList[ status ? "add" : "remove" ]( "CultUnderAttack" );
		}

		// SetAttack( this.#planet, status );
		SetAttack( this.#horror, status );
		SetAttack( this.#cultists, status );
	}

	GetNrDeadCultists () {
		return this.#dead_cultists;
	}

}

//** EOF//** File: c_Die.js

"use strict;"

class Die extends FlexBoxEntity {
	#id = null;
	#element = null;
	#e_body = null;
	#e_reroll = null;
	#selected = false;
	#value = 0;
	#reroll = false;
	#rolling = false;
	#disabled = false;
	#nr_rerolls = 0;
	#used = false;
	#temp = false;

	#prism = null;
	
	constructor ( id ) {
		super( "Die_" + id, true );

		this.#id = id;

		this.#prism = new Prism( 6, 0, 0);
		this.#prism.GetFaceElements().forEach(
			face => {
				const n = 1 + this.#prism.GetFaceIdx( face );
				face.innerHTML = n;
				if ( n === 1 ) {
					face.classList.add( "IsOne" );
				}
			}
		);
		this.#prism.SetPerspective( 300 );
		this.prism = this.#prism; //** DEBUG

		this.#element = this.GetElement();
		this.#element.classList.add( "Die" );
		
		
		this.#e_body = document.createElement( "div" );
		this.#e_body.classList.add( "DieBody" );
		this.#e_body.classList.add( "Clickable" );
		this.#e_body.dataset.id = id;
		
		this.#e_body.appendChild( this.#prism.GetElement() );
		
		this.#e_reroll = document.createElement( "p" );
		this.#e_reroll.classList.add( "Clickable" );
		this.#e_reroll.dataset.id = id;
		
		this.#element.appendChild( this.#e_body );
		this.#element.appendChild( this.#e_reroll );
	}

	// onResize ( width, height, top, left ) {
	// 	super.onResize( width, height, top, left );
	// }

	SetSize ( width, height ) {
		super.SetSize( width, height );
		this.SetBoxSize();
	}

	SetBoxSize () {
		if ( this.#e_body.offsetHeight === 0 ) {
			return 
		}
		
		const SZ = Math.round( this.#e_body.offsetHeight * 0.85 );

		this.#e_body.style.fontSize = Math.round( SZ * 0.5 ) + "px";
		this.#e_reroll.style.fontSize = Math.round( SZ * 0.33 ) + "px";
		this.#prism.SetSize( SZ, SZ );
	}

	GetId () {
		return this.#id;
	}

	GetClickTarget () {
		return this.#e_body;
	}
	
	GetClickTargets () {
		return [ this.#e_body, this.#e_reroll ];
	}

	ToggleSelected () {
		this.SetSelected( ! this.#selected );
	}

	IsSelected () {
		return this.#selected;
	}

	SetSelected ( status ) {
		if ( status && this.#used ) {
			return;
		}
		this.#selected = status;
		this.#e_body.classList[ status ? "add" : "remove" ]( "Selected" );
	}
	
	SetUsed ( status ) {
		if ( status ) {
			this.SetSelected( false );
			this.SetReroll( false );
		}
		this.#used = status;
		this.#e_body.classList[ status ? "add" : "remove" ]( "Used" );

		return this;
	}

	IsUsed () {
		return this.#used;
	}

	SetReroll ( status ) {
		this.#reroll = status;
		this.#e_reroll.classList[ status ? "remove" : "add" ]( "Hidden" );
		this.#e_reroll.innerHTML = ( status ? "&larr; &rarr;" : "" );
	}

	Roll () {
		if ( ! this.CanRoll() ) {
			
			return Promise.reject( 0 );
		}

		this.#e_reroll.innerHTML = "";
		this.#MarkFrontFace( false );

		this.#rolling = true;
		this.#value = 0;

		return new Promise(
			( resolve, _ ) => {
					this._Roll( 1, resolve );
			}
		);
	}

	_Roll ( nr_roll, resolve ) {
		this.#prism.SetRandomFront( true );

		if ( nr_roll === 1 || nr_roll < 6 ) {
			nr_roll += 1;
			setTimeout( this._Roll.bind( this, nr_roll, resolve ), DICE_ROTATE_TIME );
		} else {
			this.#rolling = false;
			// this.#prism.SetFront( 0 );
			this.#value = 1 + this.#prism.GetFront();
			
			setTimeout(
				() => {
					this.#MarkFrontFace( true );
					resolve( this.#value );
				},
				DICE_ROTATE_TIME
			);
		}
	}

	#MarkFrontFace ( status ) {
		this.#prism.GetFaceElements().forEach(
			face => {
				if ( status ) {
					if ( this.#prism.GetFaceIdx( face ) !== this.#value - 1 ) {
						face.classList.add( "NotFront" );
					}
				} else {
					face.classList.remove( "NotFront" );
				}
			}
		);
	}

	Reroll () {
		if ( ! this.CanReroll() ) {
			
			return Promise.reject( 0 );
		}

		this.#nr_rerolls += 1;
		
		this.SetReroll( false );

		return this.Roll();
	}

	Reset ( keep_temp_status = false ) {
		this.#value = 0;
		this.#nr_rerolls = 0;
		this.#rolling = false;
		
		this.SetReroll( false );
		this.SetSelected( false );
		this.SetDisabled( false );
		this.SetUsed( false );
		this.SetTemp( keep_temp_status ? this.#temp : false );
	}

	GetValue () {
		return this.#value;
	}

	SetDisabled ( status = true ) {
		this.#disabled = status;
		this.#element.classList[ status ? "add" : "remove" ]( "Disabled" );
	}

	CanRoll () {
		return ! (
			this.#disabled || this.#selected || this.#rolling || this.#used
		);
	}

	CanReroll () {
		return this.CanRoll() && this.#reroll;
	}

	HasRerolled () {
		return this.#nr_rerolls > 0;
	}

	SetTemp ( status ) {
		this.#temp = status;
		this.#e_reroll.classList[ status ? "add" : "remove" ]( "Temp" );
	}

	IsTemp () {
		return this.#temp;
	}

}

//** EOF//** File: c_DiceRow.js

"use strict;"

class DiceRow extends FlexBox {
	#lst_dice = [];
	#start_dice = 0;
	#lst_extra_dice = [];
	#lst_spirit_dice = [];
	#lst_dead_dice = [];
	#die_id = 0;

	#on_new_die = null;
	#die_width = 0;
	#die_height = 0;
	
	constructor ( start_dice, on_new_die ) {
		super( "DiceRow", "column", "evenly", "center", true );

		this.#start_dice = start_dice;
		this.#on_new_die = on_new_die;

		for ( var die, n = 0; n < start_dice; ++ n ) {
			this.AddDie( new Die( n ) );
		}
		
		this.#die_id = start_dice;

		this.SetAllAsUsed( true );
	}

	onResize ( width, height, top, left, box_width, box_height ) {
		this.#die_width = box_width;
		this.#die_height = box_height;
		this.SetEntitiesSize( this.#die_width, this.#die_height );
		// this.#lst_dice.forEach( d => d.SetBoxSize() );
		super.onResize( width, height, top, left );
	}

	GetElements () {
		const lst = this.#lst_dice.map( d => d.GetElement() );
		lst.push( this.GetElement() );
		return lst;
	}

	GetClicktargets () {
		var lst = []; 
		
		this.#lst_dice.forEach( d => lst = lst.concat( d.GetClickTargets() ) );
		
		return lst;
	}

	GetDieById ( id ) {
		const lst = this.#lst_dice.filter(
			die => die.GetId() === id
		);
		
		if ( lst.length === 1 ) {
			return lst[ 0 ];
		}

		return null;
	}

	GetDieByClickTarget ( tgt ) {
		return this.#lst_dice[ parseInt( tgt.dataset.id, 10 ) ]
	}

	Reset () {
		this.RemoveTempDies();

		//** Revive dies
		while ( this.#lst_dead_dice.length > 0 ) {
			this.ReviveDie();
		}

		//** Remove eventual artifacts
		while ( this.#lst_dice.length > this.#start_dice ) {
			this.RemoveDie( false ); //** Not to dead lst
		}
		
		
		
		this.ResetDie();
	}
	
	ResetDie () {
		this.#lst_dice.forEach(
			die => {
				die.Reset( true ); //** Keep temp status
			}
		);
	}

	Roll () {
		const lst = [];
		this.#lst_dice.forEach(
			die => {
				if ( ! die.IsUsed() ) {
					lst.push( die.Roll() )
				}
			}
		);

		return Promise.all( lst ).then(
			_ => {
				this.#lst_dice.forEach(
					d => {
						d.SetReroll( d.GetValue() !== 1 );
					}
				);
				return Promise.resolve( this.GetDiceValues() );
			}
		);
	}

	GetDiceValues () {
		var lst = [];
		
		this.#lst_dice.forEach(
			die => {
				if ( ! die.IsUsed() ) {
					lst.push(
						{ id: die.GetId(), value: die.GetValue() }
					);
				}
			}
		);
		
		return lst;
	}

	AddTempDie () {
		const die = this.AddNewDie();
		this.#lst_spirit_dice.push( die );
		die.SetUsed( false );
		die.SetTemp( true );
		return die;
	}

	AddNewDie () {
		

		var die;
		
		if ( this.#lst_extra_dice.length > 0 ) {
			die = this.#lst_extra_dice.pop();
			
		} else {
			die = new Die( ++ this.#die_id );
			this.#on_new_die( die );
		}

		die.SetDisabled( false ); //** Enable size changes
		die.SetSize( this.#die_width, this.#die_height );
		// die.SetBoxSize();
		// die.SetUsed( true ); 

		return this.AddDie( die ); //** Die be reset
	}

	AddDie ( die ) {
		

		this.AddEntity( die );
		this.#lst_dice.push( die );
		die.Reset();

		return die;
	}

	RemoveDie ( dead = true ) {
		if ( this.#lst_dice.length === 0 ) {
			
			return -1;
		}

		const die = this.#lst_dice.shift();
		
		die.SetDisabled( true );
		this.RemoveEntity( die );

		if ( dead ) {
			this.#lst_dead_dice.push( die );
		} else {
			this.#lst_extra_dice.push( die );
		}

		return this.#lst_dice.length;
	}

	GetSelectionValues () {
		const lst = [];
		
		this.#lst_dice.forEach(
			die => {
				if ( die.IsSelected() ) {
					lst.push( die.GetValue() );
				}
			}
		);
		
		

		return lst;
	}

	TestSingle ( lst_dice_values, card_value ) {
		if ( lst_dice_values.length !== 1 ) {
			return false;
		}

		return ( lst_dice_values[ 0 ] >= card_value );
	}

	IsMatch ( lst_dice_values ) {
		if ( lst_dice_values.length < 2 ) {
			return 0;
		}

		const FACE = lst_dice_values[ 0 ]

		for ( var idx = 1; idx < lst_dice_values.length; ++ idx ) {
			if ( lst_dice_values[ idx ] !== FACE ) {
				return 0;
			}
		}

		return FACE;
	}

	IsRun ( lst_dice_values ) {
		if ( lst_dice_values.length < 3 ) {
			return false;
		}

		const lst = CloneArray( lst_dice_values ).sort();

		var i1, i2;
		for ( i1 = 0, i2 = 1; i2 < lst.length; ++i1, ++i2 ) {
			if ( lst[ i1 ] + 1 !== lst[ i2 ] ) {
				return false;
			}
		}

		return true;
	}

	TestMatch ( lst_dice_values, card_value ) {
		const FACE = this.IsMatch( lst_dice_values );
		if ( FACE === 0 ) {
			return false;
		}
		
		return ( FACE * lst_dice_values.length >= card_value );
	}

	SumValues ( lst_dice_values ) {
		return lst_dice_values.reduce(
			( accumulator, current_value ) => accumulator + current_value,
			0
		);
	}

	TestRun ( lst_dice_values, card_value ) {
		if ( ! this.IsRun( lst_dice_values ) ) {
			return false;
		}
		
		return ( this.SumValues( lst_dice_values ) >= card_value );
	}
	
	TestPrecision ( lst_dice_values, card_value ) {
		return this.SumValues( lst_dice_values ) === card_value;
	}

	SetAllAsUsed ( status ) {
		this.#lst_dice.forEach(
			die => {
				die.SetUsed( status );
			}
		);
	}
	
	SetAllRoroll ( status ) {
		this.#lst_dice.forEach(
			die => {
				die.SetReroll( status );
			}
		);
	}
	
	SetSelectionUsed () {
		this.#lst_dice.forEach(
			die => {
				if ( die.IsSelected() ) {
					die.SetUsed( true );
				}
			}
		);
	}

	UnSelectSelectedDie () {
		this.#lst_dice.forEach(
			die => {
				if ( die.IsSelected() ) {
					die.SetSelected( false );
				}
			}
		);
	}

	AllDieWereUsed () {
		var status = true;

		this.#lst_dice.forEach(
			die => {
				if ( ! die.IsUsed() ) {
					status = false;
				}
			}
		);

		return status;
	}

	RemoveTempDies () {
		var die;

		while ( this.#lst_spirit_dice.length > 0) {
			die = this.#lst_spirit_dice.pop();
			
			let d = RemoveArrayElement( this.#lst_dice, die );
			
			this.#lst_extra_dice.push( die );
			this.RemoveEntity( die );
			die.SetDisabled( true );
		}
	}

	ReviveDie () {
		if ( this.#lst_dead_dice.length === 0 ) {
			
			return null;
		}

		return this.AddDie( this.#lst_dead_dice.pop() );
	}

	NrDeadDice () {
		return this.#lst_dead_dice.length;
	}
}

//** EOF//** File: const.js

"use strict;"

//** Safe to change

// const CARD_ASPECT_RATIO = 16 / 11;
const CARD_ASPECT_RATIO = 14 / 10;

//** Options

const SHOW_TIME = 5;
const NR_JOKERS = 0;

const ONE_CARD_TIME_FACTOR = 0; //** One card

const PAY_TROPHY_TIME_FACTOR = 0.25; //** 1+ cards
const PAY_SACRICIFE_TIME_FACTOR = 0.66; //** 2+ cards
const PAY_ALIGNMENT_TIME_FACTOR = 0.25; //** 2+ cards
const DrawCardsToCardRow_TIME_FACTOR = 1; //** 3+ cards */

//**

const DICE_ROTATE_TIME = GetVarCSS( "DICE_ROTATE_TIME", true );
const CARD_TRANSLATION_TIME = GetVarCSS( "CARD_TRANSLATE_TIME", true );

const NR_CULTS = 4;
const MAX_CULTISTS = 5;
const EXTRA_CULTISTS = 2;
const NR_START_DICE = 3;
const NR_CARDS_PER_TURN = 3;
const MAX_INJURIES = 3;
const NO_CULT = -1;

const PHASE_DRAW = 0;
const PHASE_PLACE_DRAWN = 1;
const PHASE_ROLL_DICE = 2;
const PHASE_ATTACK = 3;

const GAME_OVER_INJURIES = 0;
const GAME_OVER_SUMMON = 1;

const PLANET_PROTECTION_NONE = 0;
const PLANET_PROTECTION_CUTISTS = 1;
const PLANET_PROTECTION_HORROR = 2;
const PLANET_PROTECTION_ALL = 3;

//** Card values, suits and symbols

const SUIT_HEARTS = 0;
const SUIT_SPADES = 1;
const SUIT_DIAMONDS = 2;
const SUIT_CLUBS = 3;
const SUIT_JOKER = 4;
const SUIT_NAMES = [ "hearts", "spades", "diamonds", "clubs", "joker" ];

const ROYAL_JOKER = 0;
const ROYAL_JACK = 11;
const ROYAL_QUEEN = 12;
const ROYAL_KING = 13;
const ROYAL_ACE = 14;

const COLOR_RED = "Red";
const COLOR_BLACK = "Black";

const LST_SUITS = [
	{ id: SUIT_HEARTS,		symbol: "&hearts;",	color: COLOR_RED },
	{ id: SUIT_SPADES,		symbol: "&spades;",	color: COLOR_BLACK },
	{ id: SUIT_DIAMONDS,	symbol: "&diams;",	color: COLOR_RED },
	{ id: SUIT_CLUBS,		symbol: "&clubs;",	color: COLOR_BLACK },
	{ id: SUIT_JOKER,		symbol: "",	color: "" }
];

const LST_ROYALS = [
	{ value: ROYAL_JACK, symbol: "J" },
	{ value: ROYAL_QUEEN, symbol: "Q" },
	{ value: ROYAL_KING, symbol: "K" },
	{ value: ROYAL_ACE, symbol: "A" },
	{ value: ROYAL_JOKER, symbol: "&#x2605;" }
];

//** EOF//** File: main-dist.js

"use strict;"

window.addEventListener(
	"load",
	() => {
		new CardGame();
	}
);

//** EOF