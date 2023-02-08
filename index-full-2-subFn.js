
"use strict;"

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

A0.f22 = /* Init */ function ( onResize, onClick ) {
	
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
	
	A0.f17( null );
	
	this.client_onResize = onResize || null;
	this.client_onClick = onClick || null;
	
	window.visualViewport.addEventListener( "resize", A0.f17.bind( this ) );
};

A0.f17 = /* onResize */ function ( evt ) {
	
	this.viewport_width = this.viewport.offsetWidth;
	this.viewport.style.height = window.visualViewport.height + "px";
	
	this.pages_container.style.width = ( this.nr_pages * this.viewport_width ) + "px";
	
	this.pages_container.style.left = (
		- this.current_page_idx * this.viewport.offsetWidth
	) + "px";
	
	this.lst_pages.forEach(
		page => page.style.width = this.viewport_width + "px"
	);

	this.f8();
	this.f11();
	
	if ( this.client_onResize !== null ) {
		this.client_onResize( this.viewport_width, this.viewport.offsetHeight );
	}
};

A0.f18 = /* GetWidth */ function () {
	return this.viewport_width;
};

A0.f14 = /* GetHeight */ function () {
	return this.viewport.offsetHeight;
};

A0.f19 = /* ShowPage */ function ( n = "" ) {
	
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

A0.f9 = /* GetCurrentPage */ function () {
	return this.current_page_idx;
};

A0.f4 = /* GetCurrentPageId */ function () {
	return this.lst_pages[ this.current_page_idx ].id;
};

A0.f8 = /* ShowCurrentPage */ function () {
	this.f19( this.current_page_idx );
};

A0.f5 = /* ShowPreviousPage */ function () {
	this.f19( this.current_page_idx );
};

A0.f13 = /* SetPageMode */ function ( page_mode, page_rotate_id ) {
	this.page_mode = page_mode;
	this.page_rotate_id = page_rotate_id;
	this.f11();
};

A0.f11 = /* TestPageMode */ function () {
	this.show_page = false;

	if ( this.page_mode !== this.PAGE_FREE ) {
		const status = Math.sign(
			this.viewport.offsetWidth - this.viewport.offsetHeight
		);
		if ( status !== this.page_mode ) {
			if ( this.page_before_rotate === -1 ) {
				this.page_before_rotate = this.current_page_idx;
			}
			this.f19( this.page_rotate_id );
			this.show_page = true;
		} else {
			if ( this.page_before_rotate !== -1 ) {
				this.f19( this.page_before_rotate );
				this.page_before_rotate = -1;
				this.show_page = true;
			}
		}
	}

	if ( ! this.show_page ) {
		this.f8();
	}

	return this.show_page;
};

A0.f0 = /* AddClickEventListener */ function ( evt_target, js_entity ) {
	evt_target.addEventListener( 
		this.mouse_or_touch,
		this.f20.bind( this, js_entity )
	);
	
	evt_target.addEventListener(
		"contextmenu",
		this.f10.bind( this )
	);
};

A0.f6 = /* AddEventListener */ function ( element, event_name, handler ) {
	if ( event_name === "MOUSE||TOUCH" ) {
		event_name = this.mouse_or_touch;
	}
	
	if ( event_name === "mousedown" ) {
		element.addEventListener( "contextmenu", this.f10.bind( this ) );
	}

	element.addEventListener( event_name, handler );
};

A0.f12 = /* ConsumeEvent */ function ( evt ) {
	evt.stopPropagation();
	evt.preventDefault();
	return evt.target;
}

A0.f20 = /* onClick */ function ( js_entity, evt ) {
	this.f12( evt );
	if ( this.client_onClick !== null ) {
		this.client_onClick( js_entity, evt.target );
	}
};

A0.f10 = /* onContextMenu */ function ( evt ) {
	this.f12( evt );
	evt.target.click();
};

A0.f1 = /* RegisterServiceWorker */ function ( sw_file ) {
	if (
		"serviceWorker" in navigator
		&& window.location.protocol === "https:"
		&& window.cordova === undefined
	) {
		if ( this.A1 && ! this.A1.f21() ) {
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

A0.f7 = /* SetErrorHandlers */ function ( node = "AppError" ) {
	if ( typeof node === "string" ) {
		node = document.getElementById( node );
	}

	this.error_node = node;
	this.error_page = g1( node, "section" );
	window.addEventListener(
		"unhandledrejection",
		( evt ) => {
			evt.preventDefault();
			this.f15( "Unhandled rejection", evt.reason );
			
		}
	);
	window.addEventListener(
		"error",
		 evt => {
			evt.preventDefault();
			const str = [
				evt.error.message,
				evt.error.fileName,
				evt.error.lineNumber,
				this.f2( evt.error )
			].join( "<br>" );
			this.f15( "Error", str );
			
		 }
	);
};

A0.f2 = /* ProcessStackTrace */ function ( error ) {
	return error.stack.split( "at " ).join( "<br>&bull; " );
};

A0.f15 = /* ShowError */ function ( title, txt ) {
	this.error_node.innerHTML += "<h3>" + title + "</h3>" + txt;
	if ( this.error_page !== null ) {
		this.f19( this.error_page.id );
	}
};

"use strict;"

/* FlexBoxEntity */
class C0 {
	
/* #id */ #p110 = null;
/* #top */ #p109 = Infinity;
/* #left */ #p98 = Infinity;
/* #width */ #p84 = Infinity;
/* #height */ #p73 = Infinity;
/* #element */ #p65 = null;

	constructor ( id, make_element = false ) {
		this.#p110 = id;
		
		if ( make_element === true ) {
			this.#p65 = this.#P24();
		} else if ( make_element instanceof Node ) {
			this.#p65 = make_element;
			this.#p65.id = this.#p110;
			this.#p65.classList.add( "FlexBoxEntity" );
		}
	}

/* #MakeElement */ #P24 () {
		const element = document.createElement( "div" );
		element.id = this.#p110;
		element.classList.add( "FlexBoxEntity" );

		return element;
	}

/* GetId */ M195 () {
		return this.#p110;
	}

/* GetPosition */ M94 () {
		return [ this.#p109, this.#p98 ];
	}

/* GetElement */ M113 () {
		return this.#p65;
	}

/* GetWidth */ f18 () {
		return this.#p84;
	}
	
/* GetHeight */ f14 () {
		return this.#p73;
	}
	
/* GetTop */ M187 () {
		return this.#p109;
	}
	
/* GetLeft */ M173 () {
		return this.#p98;
	}
	
/* onResize */ f17 ( width, height, top, left ) {
		this.M95( top, left );
		this.M174( width, height );
	}
	
/* SetPosition */ M95 ( top, left ) {
		this.#p109 = top;
		this.#p98 = left;
		
		if ( this.#p65 !== null ) {
			this.#p65.style.top = top + "px";
			this.#p65.style.left = left + "px";
		}
	}
	
/* SetSize */ M174 ( width, height ) {
		this.#p84 = width;
		this.#p73 = height;

		if ( this.#p65 !== null ) {
			this.#p65.style.width = width + "px";
			this.#p65.style.height = height + "px";
		}
	}
}

"use strict;"

/* FlexBox */
class E3 extends C0 {

/* #orientation */ #p25 = null;
/* #justify */ #p66 = null;
/* #align */ #p85 = null;
/* #lst_entities */ #p20 = [];
/* #fn_sort_entities */ #p4 = null;
	
	constructor ( id, orientation, justify, align, make_element = false ) {
		super( id, make_element );

		this.#p25 = orientation;
		this.#p66 = justify;
		this.#p85 = align;

		if ( make_element ) {
			this.M113().classList.add( "FlexBox" );
		}

	}

/* AddEntity */ M131 ( entity, to_end = true ) {
		this.#p20[ to_end ? "push" : "unshift" ]( entity );
		if ( this.#p4 !== null ) {
			this.#p20.sort( this.#p4 );
		}
		this.M2();
	}
	
/* RemoveEntity */ M78 ( entity ) {
 g2( this.#p20, entity );
		this.M2();
	}

/* onResize */ f17 ( width, height, top, left ) {
		super.f17( width, height, top, left );
		this.M2();
	}

/* SetEntitiesSize */ M33 ( width, height ) {
		if ( this.#p20.length > 0 ) {
			this.#p20.forEach(
				e => e.M174( width, height )
			);
		}
	}

/* SetEntitiesPosition */ M2 () {
		if ( this.#p20.length === 0 ) {
			return;
		}

		var entities_width = 0, entities_height = 0;

		this.#p20.forEach(
			e => {
				entities_width += e.f18();
				entities_height += e.f14();
			}
		);

		if ( entities_width === Infinity || entities_height === Infinity ) {
			return;
		}

		var lst_left, lst_top;
		
		if ( this.#p25 === "row" ) {
			lst_left = this.#P4( this.#p66 )( true, "width", entities_width );
			lst_top = this.#P4( this.#p85 )( false, "height", entities_height );
		} else {
			lst_top = this.#P4( this.#p66 )( true, "height", entities_height );
			lst_left = this.#P4( this.#p85 )( false, "width", entities_width );
		}

		this.#p20.forEach(
			e => {
				e.M95( lst_top.shift(), lst_left.shift() );
			}
		);
	}

/* ForEachEntity */ M68 ( fn ) {
		this.#p20.forEach( e => fn( e ) );
	}

/* #GetDistributionFunction */ #P4 ( label ) {
		if ( label === "center" ) {
			return this.#P0.bind( this );
		} else if ( label === "start" ) {
			return this.#P2.bind( this );
		} else if ( label === "end" ) {
			return this.#P3.bind( this );
		} else if ( label === "evenly" ) {
			return this.#P1.bind( this );
		}
	}

/* #PrepareDistribuitonList */ #P5 ( axis, key ) {
		var position = ( key === "width" ? this.M173() : this.M187() );
		var idx, e;
		const lst = [];

		for ( idx = 0; idx < this.#p20.length; ++ idx ) {
			if ( axis ) {
				if ( idx > 0 ) {
					e = this.#p20[ idx - 1 ];
					position += ( key === "width" ? e.f18() : e.f14() );
				}
			}
			lst.push( position );
		}

		return lst;
	}

/* #MakeDistributionList_start */ #P2 ( axis, key, entities_size ) {
		return this.#P5( axis, key );
	}

/* #MakeDistributionList_center */ #P0 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p20.length;
		const THIS_KEY = ( key === "width" ? this.f18() : this.f14() );
		const step = Math.round( ( THIS_KEY - entities_size ) / 2 );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#p20[ idx ];
				lst[ idx ] += Math.round(
					(
						THIS_KEY
						- 
						( key === "width" ? e.f18() : e.f14() )
					) / 2
				);
			}
		}
				
		return lst;
	}

/* #MakeDistributionList_end */ #P3 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p20.length;
		const THIS_KEY = ( key === "width" ? this.f18() : this.f14() );
		const step = Math.round( THIS_KEY - entities_size );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#p20[ idx ];
				lst[ idx ] += THIS_KEY - ( key === "width" ? e.f18() : e.f14() );
			}
		}

		return lst;
	}
	
/* #MakeDistributionList_evenly */ #P1 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p20.length;
		const THIS_KEY = ( key === "width" ? this.f18() : this.f14() );
		const step = Math.round( ( THIS_KEY - entities_size ) / ( LEN + 1 ) );
	
		for ( var idx = 0; idx < LEN; ++ idx ) {
			lst[ idx ] += ( idx + 1 ) * step;
		}

		return lst;
	}

/* SetSortEntities */ M34 ( fn ) {
		this.#p4 = fn;
	}

/* SetJustify */ M114 ( justify ) {
		this.#p66 = justify;
	}
}
A0.A1 = {
};

A0.A1.f21 = /* Touch */ function () {
	return navigator.maxTouchPoints > 0;
};

A0.A1.f23 = /* iOS */ function () {
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes( navigator.platform )
	|| ( navigator.userAgent.includes( "Mac" ) && "ontouchend" in document );
};

A0.A1.f3 = /* RequestFullscreen */ function () {
	if ( ! document.fullscreenElement && this.f21() && ! this.f23() ) {
		if ( document.documentElement.requestFullscreen instanceof Function ) {
			document.documentElement.requestFullscreen( { navigationUI: "hide" } );
		}
	}
};

"use strict;"

/* eById */ function g13 ( id_name ) {
	return document.getElementById(id_name);
};

/* eByTag */ function g11 ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name)[0];
};

/* aByTag */ function g12 ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name);
};

/* eByClass */ function g9 (class_name, parent=document) {
	return parent.querySelector(class_name);
};

/* aByClass */ function g10 ( class_name, parent=document) {
	return parent.querySelectorAll(class_name);
};

/* GetParentNodeByTag */ function g1 ( node, tag ) {
	tag = tag.toUpperCase();
	while ( node !== null && node.tagName !== tag ) {
		node = node.parentNode;
	}
	return node;
};

/* Delay */ function g14 ( ms, data = null ) {
	return new Promise(
		( resolve, _ ) => setTimeout( resolve, ms, data )
	);
};

/* AppendChildren */ function g5 ( element, lst_children ) {
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

/* GetVarCSS */ function g8 ( var_name, as_int ) {
	const VALUE = getComputedStyle( document.documentElement )
    	.getPropertyValue( "--" + var_name.split( "--" ).pop() )
		.trim();
	return ( as_int ? parseInt( VALUE, 10 ) : VALUE );
};

Math.f16 = /* randomInt */ function ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};
/* ShuffleArray */ function g6 ( array ) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
	}
}

/* CloneArray */ function g7 ( array ) {
	return array.concat();
}

/* RemoveArrayElement */ function g2 ( array, element ) {
	if ( ! array.includes( element ) ) {
		return null;
	}
	return array.splice( array.indexOf( element), 1 ).pop();
}

/* RemoveArrayIndex */ function g3 ( array, idx ) {
	if ( idx >= array.length ) {
		return null;
	}
	return array.splice( idx, 1 ).pop();
}

/* RemoveRandomElement */ function g0 ( array ) {
	return g3( array, Math.f16( 0, array.length - 1 ) );
}

/* GetRandomElement */ function g4 ( array ) {
	return array[ Math.f16( 0, array.length - 1 ) ];
}

/* Prism */
class C3 {
/* #nr_faces */ #p52 = 0;
/* #width */ #p84 = 0;
/* #height */ #p73 = 0;
/* #is_horizontal */ #p12 = true;

/* #rx */ #p111 = 0;
/* #ry */ #p112 = 0;
/* #rz */ #p113 = 0;
/* #front_idx */ #p36 = 0;
/* #angle */ #p86 = 0;
/* #apothem */ #p67 = 0;

/* #container_3d */ #p21 = null;
/* #faces_wrapper */ #p13 = null;
/* #lst_faces */ #p37 = [];

    constructor ( nr_faces, width, height, horizontal = true ) {
        this.#p52 = nr_faces;
        this.#p84 = width;
        this.#p73 = height;
        this.#p12 = horizontal;

        this.#p86 = 360 / this.#p52;

        this.#P19();
        this.#P27();
        this.#P15( 0 );
        this.#P14();
    }

/* #MakeElements */ #P19 () {
        this.#p21 = document.createElement( "div" );
        this.#p21.classList.add( "Prism" );
        this.#p21.style.width = this.#p84 + "px";
        this.#p21.style.height = this.#p73 + "px";
        this.#p13 = document.createElement( "div" )
        this.#p13.classList.add( "PrismWrapper" );
        
        this.#p21.appendChild( this.#p13 );
        for ( var idx = 0, face; idx < this.#p52; ++ idx ) {
            face = document.createElement( "div" );
            face.classList.add( "PrismFace" );
            face.dataset.idx = idx;
            this.#p37.push( face );
            this.#p13.appendChild( face );
            face.innerHTML = idx;
        }
    }

/* #PlaceFaces */ #P27 () {
        const d = ( this.#p12 ? this.#p84 : this.#p73 );
        const axis = ( this.#p12 ? "Y" : "X" );
        this.#p67 = this.#P25( d, this.#p52 );

        for ( var idx = 0; idx < this.#p52; ++ idx ) {
            this.#p37[ idx ].style.transform = [
                "rotate" + axis + "(" + (-idx * this.#p86) + "deg)",
                "translateZ(" + this.#p67 + "px)"
            ].join( " " );
        }
    }

/* #AddToFrontIdx */ #P15 ( d ) {
        this.#p36 = this.#P32( this.#p36 + d );
    }

/* #ApplyTransform */ #P14 () {
        this.#p13.style.transform = [
            "translateZ(-" + this.#p67 + "px)",
            "rotateX(" + this.#p111 + "deg)",
            "rotateY(" + this.#p112 + "deg)",
            "rotateZ(" + this.#p113 + "deg)"
        ].join( " " );
    }
    
/* #MathApothem */ #P25 ( l, n ) {
        return Math.ceil(
            l / ( 2 * Math.tan( Math.PI / n ) )
        );
    }

/* #MathMod */ #P32 ( n ) {
        const m = this.#p52;
        n = n % m;
        return ( n >= 0 ? n : ( n + m ) );
    }

/* #MathRandomInt */ #p14 = function ( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

/* #RotateX */ #P33 ( dx ) {
        this.#p111 += ( dx * this.#p86 );
        this.#P14();
    }
    
/* #RotateY */ #P34 ( dy ) {
        this.#p112 += ( dy * this.#p86 );
        this.#P14();
    }

/* #RotateH */ #P35 ( d ) {
        const hz = this.#p12;
        this.#p12 = true;

        if ( hz !== this.#p12 ) {
            this.#p111 = 0;
            this.#p112 = ( this.#p36 * this.#p86 ) % 360;
            this.#P27();
        }

        this.#P34( d );
        this.#P15( d );
    }

/* #RotateV */ #P36 ( d ) {
        const hz = this.#p12;
        this.#p12 = false;

        if ( hz !== this.#p12 ) {
            this.#p112 = 0;
            this.#p111 = ( this.#p36 * this.#p86 ) % 360;
            this.#P27();
        }
        this.#P33( d );
        this.#P15( d );
    }

/* GetElement */ M113 () {
        return this.#p21;
    }
    
/* GetFaceElement */ M44 ( idx ) {
        return this.#p37[ this.#P32( idx ) ];
    }

/* GetFaceElements */ M35 () {
        return this.#p37.concat();
    }

/* Step */ M200 ( n = 1 ) {
        if ( this.#p12 ) {
            this.#P35( n );
        } else {
            this.#P36( n );
        }

        return this.#p36;
    }

/* GetFront */ M156 () {
        return this.#p36;
    }

/* SetFront */ M157 ( d = 0 ) {
        d = this.#P32( d );
        
        if ( d !== this.#p36 ) {
            const step1 = d - this.#p36;
            const step2 = ( step1 > 0 ? ( step1 - this.#p52 ) : ( this.#p52 + step1 ) );
            const step = ( Math.abs( step2 ) < Math.abs( step1 ) ) ? step2 : step1;
            this.M200( step );
        }

        return d;
    }

/* SetRandomFront */ M45 ( should_move = false ) {
        var n = -1;

        do {
            n = this.#p14( 0, this.#p52 - 1 );
        } while ( should_move && n === this.#p36 );

        return this.M157( n );
    }

/* SetPerspective */ M46 ( value ) {
        if ( typeof value === "number" ) {
            value += "px";
        }
        this.#p21.style.perspective = value;
    }

/* SetSize */ M174 ( width, height ) {
		this.#p84 = width;
        this.#p73 = height;
		
		this.#p21.style.width = this.#p84 + "px";
        this.#p21.style.height = this.#p73 + "px";
		
		this.#P27();
        this.#P15( 0 );
        this.#P14();
	}

    GetFaceIdx( face ) {
        return parseInt( face.dataset.idx, 10 );
    }
}

"use strict;"

/* Card */
class E5 extends C0 {
/* #id */ #p110 = null;
/* #suit */ #p99 = -1;
/* #value */ #p87 = -1;
/* #color */ #p88 = -1;
/* #face_up */ #p68 = true;
/* #selected */ #p53 = false;
/* #show_royals_value */ #p2 = true;
/* #marked */ #p74 = false;
/* #location */ #p54 = null;

/* #e_body */ #p75 = null;
/* #e_face */ #p76 = null;
/* #e_back */ #p77 = null;
/* #e_value */ #p69 = null;
/* #e_value_nr */ #p31 = null;
/* #e_value_marker */ #p9 = null;
/* #e_suit */ #p78 = null;
	constructor ( id, suit, value ) {
		super( "Card_" + id, true );

		this.#p110 = id;
		this.#p99 = suit.id;
		this.#p87 = value.nr;
		this.#p88 = suit.color;
		
		this.M158( value.symbol, value.nr, suit.symbol );
		
		this.M36( this.#p2 );
	}

/* GetClickTarget */ M47 () {
		return this.#p75;
	}

/* ShowRoyalsValue */ M36 ( status ) {
		this.#p2 = status;
		
		if ( status && ( this.M176() || this.M196() ) ) {
			this.#p31.classList.remove( "Hidden" );
		} else {
			this.#p31.classList.add( "Hidden" );
		}
	}

/* MakeBody */ M158 ( value_symbol, value_nr, suit_symbol ) {
		this.#p75 = document.createElement( "div" );
		this.#p75.classList.add( "CardBody" );
		this.#p75.classList.add( "Clickable" );
		
		this.#p76 = document.createElement( "div" );
		this.#p76.classList.add( "CardFace" );
		this.#p75.appendChild( this.#p76 )
		
		this.#p77 = document.createElement( "div" );
		this.#p77.classList.add( "CardBack" );
		this.#p75.appendChild( this.#p77 )

		this.#p69 = document.createElement( "p" );
		this.#p69.classList.add( "CardValue" );
		this.#p69.classList.add( "CardValue" + this.#p88 );
		const SPAN = document.createElement( "span" );
		SPAN.innerHTML = value_symbol;
		this.#p69.appendChild( SPAN );
		this.#p76.appendChild( this.#p69 );

		this.#p31 = document.createElement( "span" );
		if ( this.M176() || this.M196() ) {
			this.#p31.innerHTML = value_nr;
		}
		this.#p69.appendChild( this.#p31 );
		this.#p9 = document.createElement( "span" );
		this.#p69.appendChild( this.#p9 );
		
		this.#p78 = document.createElement( "p" );
		this.#p78.innerHTML = suit_symbol;
		this.#p78.classList.add( "CardSuit" );
		this.#p78.classList.add( "CardSuit" + this.#p88 );
		this.#p76.appendChild( this.#p78 );

		if ( ! this.#p68 ) {
			this.#p75.classList.add( "FaceDown" );
		}

		if ( this.M176() ) {
			this.#p76.classList.add( "CardRoyal" );
		} else if ( this.M177() ) {
			this.#p76.classList.add( "CardJoker" );
		} else if ( this.M196() ) {
			this.#p76.classList.add( "CardAce" );
		}

		const ELEMENT = this.M113();
		ELEMENT.classList.add( "Card" );
		ELEMENT.classList.add( "CardSmooth" );
		ELEMENT.classList.add( "CardHidden" );
		ELEMENT.appendChild( this.#p75 );
	}

/* GetValue */ M159 () {
		return this.#p87;
	}
	
/* GetSuit */ M175 () {
		return this.#p99;
	}
	
/* GetColor */ M160 () {
		return this.#p88;
	}

/* SetSize */ M174 ( width, height ) {
		super.M174( width, height );
		this.#p69.style.fontSize = Math.round( width * 0.3 ) + "px";
		if ( this.#p69.children.length ) {
			this.#p69.children[ 1 ].style.fontSize = Math.round( width * 0.2 ) + "px";
		}
		this.#p78.style.fontSize = Math.round( width * 0.4 ) + "px";
	}

/* SetFaceUp */ M132 ( status ) {
		this.#p68 = status;
		this.#p75.classList[ status ? "remove" : "add" ]( "FaceDown" );
	}
	
/* SetSelected */ M96 ( status ) {
		this.#p53 = status;
		this.#p75.classList[ status ? "add" : "remove" ]( "CardSelected" );
	}
	
/* ToggleSelected */ M48 () {
		this.M96( ! this.#p53 );

		return this.#p53;
	}
	
/* ClearLocation */ M69 () {
		this.#p54 = null;
	}

/* SetLocation */ M97 ( entity ) {
		

		this.#p54 = entity;
	}
	
/* IsAt */ M201 ( entity ) {
		

		return ( this.#p54 === entity );
	}
	
/* GetLocation */ M98 () {
		return this.#p54;
	}
	
/* IsRoyal */ M176 () {
		return [ k39, k32, k40 ].includes( this.#p87 );
	}

/* IsFaceCard */ M115 () {
		return this.M176();
	}
	
/* IsJoker */ M177 () {
		return ( this.#p87 === k31 );
	}
	
/* IsAce */ M196 () {
		return ( this.#p87 === k45 );
	}
	
/* IsNumber */ M161 () {
		return ( this.#p87 <= 10 );
	}
	
/* IsFaceUp */ M162 () {
		return this.#p68;
	}
	
/* IsSelected */ M116 () {
		return this.#p53;
	}

/* SetHidden */ M133 ( status ) {
		this.M113().classList[ status ? "add" : "remove" ]( "CardHidden" );
	}
	
/* SetSmooth */ M134 ( status ) {
		this.M113().classList[ status ? "add" : "remove" ]( "CardSmooth" );
	}

/* SetZindex */ M135 (value ) {
		this.M113().style.zIndex = value;
	}

/* IsRoyalOrAce */ M79 () {
		return ( this.M176() || this.M196() );
	}

/* ToString */ M163 () {
		return "#" + this.#p110 + "=" + this.#p87 + "/" + k38[ this.#p99 ];
	}

/* SetMarker */ M136 ( status, value = "&bull;" ) {
		this.#p74 = status;

		this.#p69.classList[ status ? "add" : "remove" ]( "Marked" );

		return status;
	}

/* IsMarked */ M164 () {
		return this.#p74;
	}

/* Reset */ M197 () {
		this.M96( false );
		this.M136( false );
		this.M132( false );
	}
}

"use strict;"

/* CardGame */
class C2 {

/* #viewport */ #p55 = null;
/* #messenger */ #p38 = null;
/* #menu */ #p100 = null;
/* #deck */ #p101 = null;
/* #piles_row */ #p39 = null;
/* #draw_pile */ #p40 = null;
/* #discard_pile */ #p22 = null;
/* #trophies_pile */ #p15 = null;
/* #dice_row */ #p56 = null;
/* #draw_row */ #p57 = null;
/* #store */ #p89 = null;

/* #busy */ #p102 = false;

/* #lst_cults */ #p41 = [];
/* #round */ #p90 = 0;
/* #round_phase */ #p26 = 0;
/* #game_over */ #p42 = false;
/* #attack_cult */ #p27 = k50;
/* #attack_nr */ #p43 = 0;
/* #defeated_targets */ #p5 = false;
/* #selected_planet */ #p7 = null;
/* #continue */ #p58 = null;

/* #lst_cards_out */ #p16 = null;
/* #blood */ #p91 = 0;
/* #use_blood */ #p44 = 0;

/* #planet_protection */ #p3 = k7;
/* #tmo_cost */ #p59 = 0;

	constructor () {
		this.clicked_card = null; 
		this.#p44 = parseFloat( QuerySeachString( "use_blood", 0 ) );
		this.#p3 = parseInt( QuerySeachString( "planet_protection", k7 ) );
		this.#p59 = parseInt( QuerySeachString( "tmo_cost", 0 ) );
		
		
		A0.f22( this.#P31.bind( this ), this.#P37.bind( this) );
		A0.f7();
		A0.f13( A0.PAGE_LANDSCAPE, "Rotate" );
		
		this.#p55 = g13( "GameViewport" );
		this.#p38 = new C1( k43 );
		this.#p100 = new C7( g13( "MenuPannel" ), g13( "MenuIcon" ) );
		this.#p101 = new C6( k44 );
		this.#p39 = new E2();
		this.#p56 = new E4( k21, this.onNewDie.bind( this ) );
		this.#p57 = new E1( "DrawRow", 7, true );
		this.#p57.M114( "center" );
		this.#p57.M84( false );
		this.#p89 = new C5(
 g13( "Store" ),
			this.M70.bind( this ),
			this.#p44
		);
		
		this.#p40 = this.#p39.M106();
		this.#p22 = this.#p39.M59();
		this.#p15 = this.#p39.M41();

		this.#p55.appendChild( this.#p57.M113() );

 g5( this.#p55, this.#p39.M103() );
 g5( this.#p55, this.#p56.M103() );

		for ( var cult, n = 0; n < k49; ++ n ) {
			cult = new E6( n );
			this.#p41.push( cult );
 g5( this.#p55, cult.M103() )
		}
		
 g13( "Play" ).appendChild( this.#p38.M113() );
		
		A0.f6(
			window, "contextmenu", A0.f12.bind(A0)
		);
		A0.f0(
 g13( "HomeCard" ), null
		);
		A0.f0(
 g13( "MenuIcon" ), null
		);
		A0.f0(
			this.#p38.M47(), this.#p38
		);
		this.#p100.M103().forEach(
			e => A0.f0( e, null )
		);

		A0.f0(
			this.#p40.M47(), this.#p40
		);
		A0.f0(
			this.#p22.M47(), this.#p22
		);
		A0.f0(
			this.#p15.M47(), this.#p15
		);
		A0.f0(
			this.#p57.M113(), this.#p57
		);
		this.#p56.M43().forEach(
			tgt => {
				A0.f0(
					tgt, this.#p56.M5( tgt )
				);
			}
		);
		this.#p89.M42().forEach(
			tgt => {
				A0.f0(
					tgt, this.#p89
				);
			}
		);

		this.#P31( 0, 0 );
		this.#p100.M204();
		this.#p89.M204();
		this.#P29();

		window.setTimeout(
			() => {
				A0.f11();
 g13( "AppViewport" ).classList.remove( "AppInit" );
			},
			1E3/16
		);
	}

/* #InitCards */ #P29 () {
		var card;

		while ( ( card = this.#p101.M181() ) !== null ) {
			card.M36( false );
			this.#p55.appendChild( card.M113() );
			A0.f0( card.M47(), card );
			
			card.M133( false );
			this.#p22.M178( card );
		}

		while ( ! this.#p22.M179() ) {
			this.#p40.M178( this.#p22.M57() );
		}
	}

/* #onResize */ #P31 ( width, height ) {
		const SPACING = this.#p55.offsetTop;
		const WIDTH = this.#p55.offsetWidth;

		const CELL_WIDTH = Math.round( WIDTH / 9 );
		const CELL_HEIGHT = Math.round( this.#p55.offsetHeight / 5 );

		const [ CARD_WIDTH, CARD_HEIGHT ] = this.#P20( CELL_WIDTH, CELL_HEIGHT, SPACING );

		

		this.#p101.M88( CARD_WIDTH, CARD_HEIGHT );
		
		this.#p38.f17(
			WIDTH, Math.round( CARD_HEIGHT / 2),
			0, this.#p55.offsetLeft
		);

		const W = Math.round( 6.5 * CELL_WIDTH );

		for ( var cult, top = Math.round( 0.5 * SPACING ), n = 0; n < k49; ++ n ) {
			cult = this.#p41[ n ];
			cult.f17(
				W, CELL_HEIGHT - SPACING,
				top, 0,
				CELL_WIDTH
			);
			top += CELL_HEIGHT;
		}

		const W2 = Math.round( ( this.#p55.offsetWidth - W )  / 2 );

		this.#p56.f17(
			W2, 4 * CELL_HEIGHT,
			0, W,
			W2 - 2 * SPACING,
			Math.floor( 4 * CELL_HEIGHT / 6 - SPACING )
		);

		this.#p39.f17(
			W2, 4 * CELL_HEIGHT,
			0, W + W2,
			CARD_WIDTH, CARD_HEIGHT
		);

		this.#p57.f17(
			W, CELL_HEIGHT - SPACING,
			top, 0
		);

		this.#p89.f17(
			WIDTH, Math.ceil( CELL_HEIGHT + SPACING * 0.55 ),
			this.#p55.offsetLeft
		);
	}

/* #CalcCardSize */ #P20 ( cell_width, cell_height, spacing ) {
		const K = 2 * spacing;
		var card_width = cell_width - K;
		var card_height = Math.round( card_width * k10 );
		
		if ( card_height > cell_height - K ) {
			card_height = cell_height - K;
			card_width = Math.round( card_height / k10 );
		}

		return [ card_width, card_height ];
	}

/* #MoveGroupOfCards */ #P8 ( time_factor, nr_cards, fn ) {
		if ( nr_cards === 0 ) {
			return Promise.resolve( null );
		}

		const lst_promises = [];
		const MS = k6 * time_factor;
		var delay = 0;

		

		while ( nr_cards -- > 0 ) {
			lst_promises.push(
 g14( delay ).then(
					_ => {
						fn();
					}
				)
			);
			delay += MS;
		}
		
		lst_promises.push( g14( delay - MS + k6 ) );

		return Promise.all( lst_promises );
	}
	
/* #DrawCardsToCardRow */ #P7 ( draw_pile, card_row, nr_cards, to_end = true ) {
		

		const lst = [];

		return this.#P8(
			DrawCardsToCardRow_TIME_FACTOR,
			Math.min( nr_cards, draw_pile.M118() ),
			_ => {
				let card = draw_pile.M57();
				card_row.M178( card, to_end );
				lst.push( card );
				if ( ! this.#p16.includes( card ) ) {
					this.#p16.push( card );
				}
			}
		).then(
			_ => Promise.resolve( lst )
		);
	}

/* #DiscardRemainingCards */ #P6 () {
		this.#p101.M102( card => card.M134( false ) );
		
		const DISCARD = this.#p22;
		
		this.#p40.M39( DISCARD );
		this.#p15.M39( DISCARD );
		this.#p41.forEach( c => c.M120( DISCARD ) );
		this.#p57.M120( DISCARD );
	}

/* #MakeDrawPile */ #P21 () {
		this.#P10( this.#p101.M15(), this.#p40 );

		setTimeout(
			_ => this.#p101.M102( card => card.M134( true ) ),
			0
		);
	}

/* #SendCardsToPile */ #P10 ( lst_cards, target_pile ) {
		

		var card;

		while ( lst_cards.length > 0 ) {
			card = lst_cards.pop();
			
			card.M98().M119( card );
			target_pile.M178( card );
		}
	}
	
/* #Warn */ #P39 ( txt ) {
		if ( this.#p58 === null ) {
			
			this.#p38.M104( txt );
		} else {
			
			
		}
	}

/* #onClick */ #P37 ( js_entity, evt_target ) {

		if ( this.#p100.IsIcon( evt_target ) ) {
			return this.#P11( evt_target.id.split( "_" ).pop() );
		}
		if ( evt_target.id === "HomeCard" ) {
			return this.#P11( "Play" );
		}
		if ( this.#p58 !== null ) {
			if ( js_entity === this.#p38 ) {
				this.#p58();
				
			} else {
				
				
				
			}
			return;
		}
		if ( this.#p102 ) {
			
			return;
		}
		if ( this.#p42 ) {
			
			return;
		}

		if ( js_entity instanceof E5 ) {
			if ( js_entity.M162() || js_entity.M201( this.#p57 ) ) {
				this.#P26( js_entity );
			} else {
				this.#P12( js_entity.M98() );
			}
		} else if ( js_entity instanceof E0 ) {
			this.#P12( js_entity );
		} else if ( js_entity instanceof E7 ) {
			this.M117( js_entity, evt_target );
		} else if ( js_entity === this.#p89 ) {
			this.onClickStoreItem( evt_target );
		}  else if ( js_entity === this.#p57 ) {
			if ( this.#p26 === k12 ) {
				const CARD = this.#p57.M73();
				if ( CARD !== null ) {
					this.M8( CARD );
				}
			}		
		} else {
			
		}
	}

/* OnClickDie */ M117 ( die, evt_target ) {
		

		if ( this.#p26 !== k25 ) {
			return this.#P39( "Not on attack phase." );
		}

		if ( evt_target === die.M47() ) {
			die.M48();
		} else {
			if ( die.M150() || this.#p89.M17() ) {
				this.#p102 = true;
				if ( ! die.M150() ) {
					this.#p89.M142();
					die.M149( true );
				}
				die.M192().then(
					_ => {
						return this.M13( false ); 
					}
				);
			}
		}
	}

/* #onClickMenuIcon */ #P11 ( id ) {
		

		if ( id === "MenuIcon" ) {
			this.#p100.M189();
		} else if ( id === "Play" ) {
			if ( A0.f4() === "Play" ) {
				this.#P38();
			} else {
				this.#p100.M169( true );
				this.#p100.M203();
				A0.f19( "Play" );
			}
		} else if ( id === "Home" ) {
			this.#p100.M204();
			this.#p100.M169( false );
			A0.f19( "Home" );
		} else {
			A0.f19( id );
		}
	}

/* #onClickCard */ #P26 ( card ) {
		
		
		this.clicked_card = card; 

		if ( this.#p102 ) {
			
			return;
		}

		if ( this.#p26 === k12 ) {
			this.M8( card );
		} else if ( this.#p26 === k25 ) {
			if ( card.M196() ) {
				this.M26( card );
			} else {
				this.M49( card );
			}
		} else {
			
		}
	}

/* GetCardCultByLocation */ M0 ( card ) {
		const location = card.M98().M195().split( "_" );

		if ( ! [ "Planet", "Horror", "Cultists" ].includes( location[ 0 ] ) ) {
			return null;
		}

		return this.#p41[  parseInt( location[ 1 ], 10 ) ];
	}

/* TestAttackCard */ M49 ( card ) {
		

		const CULT = this.M0( card );
		if ( CULT === null ) {
			return this.M7( "Card is not at a cult." );
		}

		if ( card.M161() && this.#p89.M4() ) {
			return this.M71( card );
		}

		if ( this.#p27 !== k50 && this.#p27 !== CULT.M195() ) {
			return this.M7( "You are now attacking " + this.M99( this.#p27 ) + "." );
		}

		if ( card.M161() && CULT.M148() ) {
			return this.M7( "Cultist is protected by a Horror. You may use a sacrifice." );
		}

		const lst_dice_values = this.#p56.M10();
		if ( lst_dice_values.length === 0 ) {
			if ( card.M176() ) {
				const VALUE = card.M159();
				var txt;
				if ( VALUE === k39 ) {
					txt = "Pair of identical dice";
				} else if ( VALUE === k32 ) {
					txt = "3 dice run";
				} else {
					txt = "4 matching dice"
				}
				return this.#P39(
					"Level " + ( VALUE - 10 ) + " Horror &raquo; " + txt + "."
				);
			}
			if ( card.M161() ) {
				return this.#P39(
					"Cultist &raquo; 1 Die | 2+ Matching Dice | 3+ Dice Run | Precision | Sacrifice"
				);
			}
			return this.M7( "Select a die, or dice combination, before attacking a card." );
		}

		if ( ! this.M50( lst_dice_values, card ) ) {
			if ( lst_dice_values.length === 1 ) {
				return this.M7( "Die cannot be used against this card." );
			}
			return this.M7( "Dice combination cannot be used against this card." );
		}

		

		if ( this.#p27 === k50 ) {
			this.#p27 = CULT.M195();
			CULT.M65( true );
			this.#p89.M203();
			
		} 

		this.M11( CULT, card );
	}
	
/* WarnAndUnselectDie */ M7 ( txt ) {
		this.#P39( txt );
		this.#p56.M6();
	}

/* PerformCardAttack */ M11 ( cult, card ) {
		
		
		
		this.#p56.M32();

		this.#p5 = true;

		if ( card.M161() ) {
			this.#p91 += card.M159();
		}
		
		this.#P8(
 k8,
			1,
			_ => {
				cult.M119( card );
				this.#p15.M178( card );
			}
		).then(
			_ => {
				
				this.#p89.M203();
				if ( this.#p56.M66() ) {
					
					if ( this.#p43 === 1 ) {
						if ( cult.M124() ) {
							this.#P39( "Starting 2nd attack on " +  this.M99( this.#p27 ) + "..." );
							this.#p56.M67();
							return this.M22().then(
								_ => {
									
									this.#p89.M203();
								}
							);
						} else {
							
							this.#p56.M92( true );
							this.#p102 = false;
						}
					} else {
						
					}
				}
			}
		);
	}

/* GetCultName */ M99 ( cult_id ) {
		if ( cult_id === k50 ) {
			return 
		}
		if ( cult_id instanceof E6 ) {
			cult_id = cult_id.M195();
		}
		return k38[ cult_id ].toUpperCase()
	}

/* ValidateAttack */ M50 ( lst_dice_values, card ) {
		const CARD_VALUE = card.M159();
		const DICE_ROW = this.#p56;
		
		if ( card.M161() ) {
			if ( DICE_ROW.M129( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.M153( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.M186( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			if ( DICE_ROW.M77( lst_dice_values, CARD_VALUE ) ) {
				return true;
			}
			return false;
		}
		
		if ( card.M176() ) {
			if ( CARD_VALUE === k39 ) {
				if ( lst_dice_values.length !== 2 ) {
					return false;
				}
				return DICE_ROW.M185( lst_dice_values ) !== 0;
			}

			if ( CARD_VALUE === k32 ) {
				if ( lst_dice_values.length !== 3 ) {
					return false;
				}
				return DICE_ROW.M199( lst_dice_values );
			}
			
			if ( lst_dice_values.length !== 4 ) {
				return false;
			}
			return DICE_ROW.M185( lst_dice_values ) !== 0;
		}
		
		
		return false;
	}

/* #onClickCardPile */ #P12 ( card_pile ) {
		

		if ( this.#p102 ) {
			
			return;
		}

		if ( card_pile === this.#p40 ) {
			if ( this.#p7 !== null ) {
				this.M27( "reshuffle" );
			} else {
				this.M24();
			}
		} else if ( card_pile === this.#p22 ) {
			if ( this.#p7 !== null ) {
				this.M27( "discard" );
			}
		} else if ( card_pile === this.#p15 ) {
			this.#p89.M189();
		}
	}
	
/* #Start */ #P38 () {
		

		if ( this.#p102 ) {
			
			return;
		}
		
		this.#p102 = true;
		this.#p42 = false;
		this.#p7 = null;
		this.#p91 = 0;

		this.#p41.forEach(
			cult => cult.M197()
		);

		this.#p38.M204();
		this.#p100.M204();
		this.#p100.M121( false );

		this.#p56.M197();
		
		this.#P6();
		this.#p101.M197();
		this.#p101.M180();
		this.#P21();

		this.#p16 = [];

		this.#p22.M168( k6 );
		this.#p15.M168( k6 );

		this.M165();

		setTimeout(
			() => {
				this.#p100.M121( true );
				this.#p22.M168( k6 );
				this.#p15.M168( k6 );
			},
 k11 * k6
		);
	}

/* FindFullCult */ M80 () {
		

		var summon_cult_id = k50;
		this.#p41.forEach(
			cult => {
				if ( cult.M62() ) {
					summon_cult_id = cult.M195();
				}
			}
		);
		
		
		return summon_cult_id;
	}

/* NewRound */ M165 () {
		this.#p90 += 1;
		

		this.#p102 = true;

		var summon_cult_id = this.M80();
		if ( summon_cult_id !== k50 ) {
			return this.M166( false, k14, summon_cult_id );
		}

		this.#p26 = k35;
		if ( this.#p27 !== k50 ) {
			this.#p41[ this.#p27 ].M65( false );
		}
		this.#p27 = k50;
		this.#p43 = 0;
		this.#p5 = false;
		
		this.#p56.M67();
		this.#p56.M92( true );
		this.#p89.M204();

		var nr_planets = 0;
		this.#p41.forEach(
			cult => {
				nr_planets += ( cult.M147() ? 1 : 0 );
				cult.M18();
			}
		);

		this.M137( nr_planets );
	}

/* DrawCards */ M137 ( nr_planets ) {
		

		if ( this.#p40.M179() ) {
			return this.M166( true );
		}

		this.#P7(
			this.#p40, this.#p57, k11 + nr_planets
		).then(
			lst_cards => {
				
				this.#p57.M73().M132( true );
				this.#p26 = k12;
				this.#p102 = false;
				
			}
		);
	}

/* TestPlaceDrawnCard */ M8 ( card ) {
		if ( ! card.M201( this.#p57 ) ) {
			return this.#P39( "Place cards from the draw row." );
		}

		this.#p102 = true;
		
		if ( card.M196() ) {
			this.#P7(
				this.#p40, this.#p57, 1
			);
		}

		this.M51().then(
			_ => {
				this.#p102 = false;
				if ( card.M161() ) {
					if ( card.M98().M188() ) {
						return this.M166( false, k14, card.M175() );
					}
				}
				if ( this.#p57.M179() ) {
					
					return this.M22();
				} else {
					this.#p57.M73().M132( true );
				}
			}
		);
	}

/* PlaceDrawnCard */ M51 () {
		const CARD = this.#p57.M85(); 
		
		CARD.M132( true );

		const CULT = this.#p41[ CARD.M175() ];

		if ( CARD.M161() ) {
			return this.M12( CULT, CARD );
		}
		
		if ( CARD.M196() ) {
			return this.M21( CULT, CARD );
		}
		return this.M20( CULT, CARD );
	}

/* PlaceDrawnHorror */ M20 ( cult, drawn_horror ) {
		
		
		

		
		

		if ( cult.M75() < drawn_horror.M159() - 10 ) {
			
			return this.M138( drawn_horror );
		}

		if ( ! cult.M148() ) {
			
			return this.#P8(
 k8,
				1,
				_ => {
					cult.M145( drawn_horror );
				}
			);
		}
		const horror = cult.M125();
		if ( horror.M159() < drawn_horror.M159() ) {
			
			return this.#P8(
 k8,
				1,
				_ => {
					cult.M119( horror );
					this.#p22.M178( horror ); }
			).then(
				_ => {
					cult.M145( drawn_horror );
				}
			);
		} else {
			return this.#P8(
 k8,
				1,
				_ => {
					this.#p22.M178( drawn_horror );
				}
			);
		}
	}

/* PlaceDrawnCultist */ M12 ( cult, card ) {
		
		

		return this.#P8(
 k8,
			1,
			_ => {
				cult.M123( card );
			}
		);
	}
	
/* PlaceDrawnPlanet */ M21 ( cult, card ) {
		
		

		return this.#P8(
 k8,
			1,
			_ => {
				cult.M146( card, this.#p90 );
			}
		);
	}

/* AddTrophy */ M138 ( card ) {
		

		return this.#P8(
 k8,
			1,
			_ => {
				const location = card.M98();
				if ( location !== null ) {
					location.M119( card );
				}
				this.#p15.M178( card );
			}
		).then(
			() => {
				if ( this.#p26 !== k12 ) {
					this.#p89.M203();
				}
			}
		);
	}

/* ResetAndRollDice */ M22 () {
		

		this.#p102 = true;
		this.#p26 = k17;

		this.#p56.M172();

		return this.#p56.M205().then(
			lst_results => {
				
				this.M13( lst_results );
			}
		);
	}

/* ProcessRolledDice */ M13 ( lst = null ) {
		

		if ( lst === false ) {
			
		}
		const REROLL = ( lst === false );

		if ( lst === null || lst === false ) {
			lst = this.#p56.M76();
		}

		var idx, data, die, nr_1s = 0;
		for ( idx = 0; idx < lst.length; ++ idx ) {
			data = lst[ idx ];
			
			die = this.#p56.M127( data.id );
			if ( data.value === 1 ) {
				nr_1s += 1;
				die.M149( false );
			} else {
				die.M149( ! die.M112() );
			}
		}

		

		if ( nr_1s > lst.length / 2 ) {
			this.M81( true, nr_1s );
		} else if ( ! REROLL ) {
			this.M23();
		} else {
			this.#p102 = false; 
		}
	}

/* StartAttackPhase */ M23 () {
		

		this.#p26 = k25;
		this.#p43 += 1;
		this.#p5 = false;

		this.#p89.M203();
		this.M202();

		this.#p102 = false;

	}

/* SufferInjury */ M81 ( to_many_1s, nr_1s = 0 ) {
		

		const NR_INJURIRES = 1 + this.#p56.M130();
		
		

		var txt = "You suffred an injury: ";
		if ( to_many_1s ) {
			txt += "to many 1s."
		} else {
			txt += "no defeated targets."
		}

		this.M198( txt ).then(
			() => {
				if ( NR_INJURIRES === k24 ) {
					this.M166( false, k9 );
				} else {
					var remove_die = true;
					if ( to_many_1s && this.#p59 > 0 ) {
						const COST = this.#p59 * nr_1s;
						
						if ( this.#p15.M118() >= COST ) {
							remove_die = false;
							this.#P39(
								"Paying " + COST + " trophies to not lose a die."
							);
							this.#P8(
								1,
								COST,
								() => {
									this.#p22.M178( this.#p15.M57() );
								}
							);
						} else {
							this.#P39(
								"Cannot pay " + COST + " trophies to not lose a die."
							);
						}
					}
					if ( remove_die ) {
						this.#p56.M152();
					}
					this.M165(); 
				}
			}
		);
	}

/* Alert */ M198 ( txt ) {
		this.#p38.M198( txt );
		return new Promise(
			 ( resolve, _  ) => {
				this.#p58 = () => {
					this.#p58 = null;
					this.#p38.M122();
					resolve();
				}
			}
		);
	}

/* GameOver */ M166 ( status, reason = null, suit_id = null) {
		
		
		this.#p42 = true;
		this.#p102 = false;

		this.#p38.M122();

		const PREFIX = "Round " + this.#p90 + " &raquo; ";

		if ( ! status ) {
			if ( reason === k9 ) {
				this.#p38.M105(
					PREFIX + "You suffered to many injuries and died.."
				);
			} else if ( reason === k14 ) {
				this.#p41[ suit_id ].M63( true );
				this.#p38.M105(
					PREFIX + "The Cultists of " + this.M99( suit_id )
					+ " mannaged to summon an Elder God. Darkness reigns!"
					);
			}
		} else {
			this.#p38.M105(
				PREFIX + "Well done! You fought with courage and wisdom."
			);
		}
	}

/* EndAttackAndDraw */ M24 () {
		

		if ( this.#p26 !== k25 ) {
			return this.#P39( "Round " + this.#p90 + " &raquo; Not the time to draw cards." );
		}

		this.#p89.M204();
		if ( ! this.#p5 ) {
			
			if ( this.M9() ) {
				return this.M81( false ); 
			}
			
		}
		
		this.M165();
	}

/* HasTargetsToAttack */ M9 () {
		var has_targets = false;

		if ( this.#p27 === k50 ) {
			this.#p41.forEach(
				cult => {
					if ( cult.M124() ) {
						has_targets = true;
					}
				}
			);
		} else {
			const CULT = this.#p41[ this.#p27 ];
			has_targets = CULT.M124();
		}

		return has_targets;
	}

	onNewDie ( die ) {
		const E = die.M113();
		this.#p55.appendChild( E );
		A0.f0( E, die );
	}

	onClickStoreItem ( e_item ) {
		

		const NR_TROPHIES = this.#p15.M118();
		const TEST_ITEM = this.#p89.M171( e_item, NR_TROPHIES, this.#p91 );
		
		
		if ( TEST_ITEM === null ) {
			return 
		}

		const item_code = TEST_ITEM.item_code;

		if ( item_code === k15 ) {
			return this.#P39( "Requested &raquo; Alignment Control." );
		}
		if ( item_code === k16 ) {
			return this.#P39( "Requested &raquo; Sacrifice." );
		}

		if ( TEST_ITEM.status === k18 ) {
			var txt = "Not enough resources &raquo; Needed: "
			if ( this.#p44 ) {
				txt += TEST_ITEM.trophies_cost + " trophies";
				txt += " and " + TEST_ITEM.blood_cost + " blood"
			} else {
				txt += TEST_ITEM.item_cost + " trophies";
			}
			return this.#P39( txt + "." );
		}

		if ( ! this.M25( item_code ) ) {
			return;
		}
		const item_cost = TEST_ITEM.item_cost;
		
		if ( isNaN( item_cost ) ) {
			return 
		}

		this.#p89.M204();

		this.M206(
			item_cost,
			item_code,
			{ blood_cost: TEST_ITEM.blood_cost, nr_trophies: NR_TROPHIES }
		).then(
			() => {
				this.M53( item_code );
			}
		);
	}

/* ValidateItemCode */ M25 ( item_code ) {
		

		

		if ( item_code === k26 ) {
			if ( this.#p26 !== k25 ) {
				this.#P39( "Not on attack phase." );
				return false;
			}
			if ( this.#p27 === k50 ) {
				this.#P39( "Not attacking a cult, yet." );
				return false;
			}
			return true;
		}
		
		if ( item_code === k34 ) {
			return true;
		}
		
		if ( item_code === k42 ) {
			return true;
		}
		
		if ( item_code === k27 ) {
			if ( this.#p56.M130() === 0 ) {
				this.#P39( "You have no dead dice." );
				return false;
			}
			return true;
		}

		if ( item_code === k27 ) {
			return true;
		}
		
		if ( item_code === k19 ) {
			if ( this.#p26 === k25 ) {
				this.#P39( "Cannot buy artifac during attack." );
				return false;
			}
			return true;
		}
		
		this.#P39( "Sorry, not implemented." );

		return false;
	}

/* MakeStoreData */ M70 () {
		const lst = [];
		this.#p41.forEach(
			cult => lst.push( cult.M19() )
		);
		return {
			round: this.#p90,
			attack: this.#p43 === 0 ? "No" : this.#p43,
			attacking: this.#p27 !== k50 ? this.M99( this.#p27 ) : "None",
			funds: this.#p15.M118(),
			injuries: this.#p56.M130() + "/" + k24,
			blood: this.#p91,
			dead: lst
		};
	}

/* UnselectPlanet */ M52 () {
		
		this.#p7.M96( false );
		this.#p7 = null;
	}

/* TestAttackPlanet */ M26 ( card ) {
		

		if ( card.M116() ) {
			
			
			this.M52();
			return;
		}

		const CULT = this.M0( card );
		if ( CULT.M64() !== this.#p90 ) {
			if ( this.#p3 !== k5 ) {
				if ( this.#p3 === k7 && CULT.M124() ) {
					
					return this.#P39( "Planet is protected by Cultists and/or Horror." );
				}
				if ( this.#p3 === k3 && CULT.M148() ) {
					
					return this.#P39( "Planet is protected by Horror." );
				}
				if ( this.#p3 === k2 && CULT.M110() ) {
					
					return this.#P39( "Planet is protected by Cultists." );
				}
			}
		}

		if ( ! this.#p89.M3() ) {
			
			return this.#P39( "Request an ALIGNMENT CONTROL from the store." );
		}
		
		if ( this.#p7 !== null ) {
			
			this.M52();
		}

		
		
		card.M96( true );
		this.#p7 = card;
	}

/* TestSacrifice */ M71 ( card ) {
		

		if ( ! this.#p89.M4() ) {
			
			return this.#P39( "Request a Sacrifice from the store." );
		}

		const CULT = this.M0( card );
		

		const COST = this.#p89.M30( card );
		

		

		const NR_TROPHIES = this.#p15.M118();
		var BLOOD_COST = 0;
		if ( COST > NR_TROPHIES ) {
			if ( ! this.#p44 ) {
				this.#p89.M60();
				return this.#P39(
					"Not enough trophies to sacrifice this Cultist. Needed: " + COST + "."
				);
			}
			BLOOD_COST = this.#p89.M89( COST, NR_TROPHIES );
			if ( BLOOD_COST > this.#p91 ) {
				this.#p89.M60();
				return this.#P39(
					"Not enough trophies and blood to sacrifice this Cultist."
					+ " Needed: " + COST + " or " + COST + " + " + BLOOD_COST + "."
				);
			}
		}

		return this.M206(
			COST,
 k16,
			{ card: card, blood_cost: BLOOD_COST, nr_trophies: NR_TROPHIES }
		).then(
			() => {
				this.#p91 += card.M159();
				this.M53(
 k16,
					{ card: card, cult: CULT }
				);
			}
		);
	}

/* TestPlanetAction */ M27 ( action ) {
		
		

		
		
		const CULT = this.M0( this.#p7 );
		
		
		const UPON_APPEARENCE = ( CULT.M64() === this.#p90 );
		
		
		const COST = this.#p89.M31( action, UPON_APPEARENCE );
		

		

		const NR_TROPHIES = this.#p15.M118();
		var BLOOD_COST = 0;
		if ( COST > NR_TROPHIES ) {
			if ( ! this.#p44 ) {
				this.M52();
				this.#p89.M61();
				return this.#P39(
					"Not enough trophies to " + action + " planet."
					+ " Needed: " + COST + "."
				);
			}
			BLOOD_COST = this.#p89.M89( COST, NR_TROPHIES );
			if ( BLOOD_COST > this.#p91 ) {
				this.#p89.M61();
				return this.#P39(
					"Not enough trophies and blood to " + action + " planet."
					+ " Needed: " + COST + " or " + COST + " + " + BLOOD_COST + "."
				);
			}
		}
		
		return this.M206(
			COST,
 k15,
			{
				action: action === "discard" ? "destroy" : "return",
				suit:  this.#p7.M175(),
				blood_cost: BLOOD_COST,
				nr_trophies: NR_TROPHIES
			}
		).then(
			() => {
				this.M53(
 k15,
					{ action: action, cult: CULT }
				);
			}
		);
	}

/* Pay */ M206 ( item_cost, item_code, data = null ) {
		var time_factor;

		
		

		const NR_TROPHIES = data.nr_trophies;
		var txt_cost = "";
		if ( item_cost > NR_TROPHIES ) {
			
			const BLOOD_COST = data.blood_cost;
			
			this.#p91 -= BLOOD_COST;
			item_cost = NR_TROPHIES;
			if ( NR_TROPHIES > 0 ) {
				txt_cost = NR_TROPHIES + " trophies and "
			}
			txt_cost += BLOOD_COST + " blood";
		} else {
			txt_cost = item_cost + " trophies";
		}
		txt_cost = "Paying " + txt_cost + " ";
		
		if ( item_code === k16 ) {
			time_factor = k0;
			this.#P39(
				txt_cost + "to sacrifice "
				+ data.card.M159() + " of "
				+ this.M99( data.card.M175() )
				+ "."
			);
		} else if ( item_code === k15 ) {
			time_factor = k1;
			this.#P39(
				txt_cost + "to "
				+ data.action + " Planet of "
				+ this.M99( data.suit )
				+ "."
			);
		} else {
			time_factor = k4;
			this.#P39(
				txt_cost + "for store item: "
				+ this.#p89.M107( item_code )
				+ "."
			);
		}

		return this.#P8(
			time_factor,
			item_cost,
			() => {
				this.#p22.M178( this.#p15.M57() );
			}
		);
	}

/* ApplyStoreItem */ M53 ( item_code, data = null ) {
		

		if ( item_code === k42 ) {
			const DIE = this.#p56.M128();
			
			if ( this.#p26 === k25 ) {
				DIE.M182( false );
				DIE.M205().then(
					value => {
						this.#p89.M203();
						DIE.M149( value !== 1 );
						this.M13( false ); 
					}
				);
			} else {
				DIE.M182( true );
			}

			return DIE;
		}
		
		if ( item_code === k26 ) {
			if ( this.#p27 !== k50 ) {
				this.#p41[ this.#p27 ].M65( false );
			}
			this.#p27 = k50;
			this.#p43 = 0;
			this.#p56.M67();
			this.#p89.M203();
			return this.M22().then(
				() => {
					
				}
			);
		}

		if ( item_code === k34 ) {
			this.#p89.M141();
			return null;
		}

		if ( item_code === k27 ) {
			const DIE = this.#p56.M155();
			if ( this.#p26 === k25 ) {
				DIE.M182( false );
				DIE.M205().then(
					value => {
						this.#p89.M203();
						DIE.M149( value !== 1 );
						this.M13( false ); 
					}
				);
			} else {
				DIE.M182( true );
			}
			return DIE;
		}

		if ( item_code === k19 ) {
			return this.#p56.M151().M182( true );
		}

		if ( item_code === k15 ) {
			const CARD = this.#p7;
			data.cult.M119( CARD );
			this.M52();
			this.#p89.M91();

			if ( data.action === "reshuffle" ) {
				this.#P8(
 k8,
					1,
					() => {
						this.#p40.M178( CARD );
					}
				).then(
					() => {
						this.#p40.M83();
					}
				);
			} else if ( data.action === "discard" ) {
				this.#P8(
 k8,
					1,
					() => {
						this.#p22.M178( CARD );
					}
				);
			}

			return CARD;
		}

		if ( item_code === k16 ) {
			this.#p89.M90();
			this.#p5 = true;
			
			this.#P8(
 k8,
				1,
				() => {
					data.cult.M119( data.card );
					this.#p22.M178( data.card );  
					this.#p89.M203();
				}
			);
			
			return data.card;
		}
	}

/* Help */ M202 () {
		if ( this.#p16 === null ) {
			return;
		}

		console.debug( "Help >> Round:", this.#p90 );

		var lst = Array( [], [], [], [] );

		this.#p16.forEach(
			card => lst[ card.M175() ].push( card.M159() )
		);

		var cult_id = 0;
		lst.forEach(
			lst_cards => {
				var str = this.M99( cult_id ++ )[ 0 ];
				str += " = ";
				var cultist = false;
				lst_cards.sort( (a,b)=>b-a);
				lst_cards.forEach(
					n => {
						if ( n === k45 ) {
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

"use strict;"

/* CardPile */
class E0 extends E3 {
/* #id */ #p110 = null;
/* #lst_cards */ #p45 = [];
/* #delay */ #p92 = 0;
/* #top_card_face */ #p17 = false;
/* #base */ #p103 = null;
/* #e_counter */ #p46 = null;

	constructor ( id ) {
		super( id, "column", "center", "center", true );

		this.#p110 = id;

		this.#p103 = new C0( this.#p110 + "_Base", true );
		this.M131( this.#p103 );

		const E_BASE = this.#p103.M113();
		E_BASE.classList.add( "CardPileBase" );
		E_BASE.classList.add( "Clickable" );

		this.#p46 = document.createElement( "p" );
		this.#p46.classList.add( "Hidden" );
		E_BASE.appendChild( this.#p46 );
	}

/* GetBaseElement */ M54 () {
		return this.#p103.M113();
	}

/* GetCards */ M167 () {
		return g7( this.#p45 );
	}

/* SetTopCardFace */ M55 ( status ) {
		this.#p17 = status;
		if ( this.#p45.length > 0 ) {
			this.#p45[ this.#p45.length - 1 ].M132( status );
		}
	}

/* UpdateEntities */ M56 ( card_width, card_height ) {
		this.M33( card_width, card_height );
		this.M2();
		this.#P9();
		this.#p46.style.fontSize = Math.round( card_width * 0.12 ) + "px";
	}

/* #SetCardsPosition */ #P9 () {
		const [ TOP, LEFT ] = this.#p103.M94();
		this.#p45.forEach(
			card => card.M95( TOP, LEFT )
		);
	}

/* SetCardsIndex */ M72 () {
		var z = 1;
		this.#p45.forEach(
			card => card.M135( z ++ )
		);
	}

/* SetDelay */ M168 ( value ) {
		this.#p92 = value;
	}
	
/* AddCardToTop */ M82 ( card ) {
		this.M178( card, true );
	}
	
/* AddCardToBottom */ M37 ( card ) {
		this.M178( card, false );
	}
	
/* AddCard */ M178 ( card, to_top = true ) {
		

		if ( this.#p45.includes( card) ) {
			return 
		}

		this.#p45[ to_top ? "push" : "unshift" ]( card );
		
		
		const [ TOP, LEFT ] = this.#p103.M94();
		card.M96( false );
		card.M132( false );
		card.M95( TOP, LEFT );
		if ( to_top ) {
			card.M135( 100 + this.#p45.length );
		} else {
			card.M135( 0 );
		}
		card.M97( this );

 g14( this.#p92 ).then(
			_ => {
				this.#p46.innerHTML = this.#p45.length;
				this.M72();
				this.M14();
			}
		);
	}

/* GetBasePosition */ M38 () {
		return this.#p103.M94();
	}

/* GetCardFromTop */ M57 () {
		if ( this.#p45.length === 0 ) {
			
			return null;
		}

		const CARD = this.#p45.pop();
		CARD.M135( 100 + this.#p45.length );
		CARD.M133( false );
		this.M14();
		this.#p46.innerHTML = this.#p45.length;

		return CARD;
	}

/* HideAllButTopCard */ M14 () {
		var idx = this.#p45.length - 1;

		if ( idx >= 0 ) {
			var card = this.#p45[ idx ];
			card.M133( false );
			card.M132( this.#p17 );
			for ( -- idx; idx >= 0; -- idx ) {
				card = this.#p45[ idx ];
				card.M133( true );
				card.M132( false );
			}
		}
	}

/* IsEmpty */ M179 () {
		return ( this.#p45.length === 0 );
	}
	
/* GetNrCards */ M118 () {
		return this.#p45.length;
	}

/* RemoveCard */ M119 ( card ) {
		

		if ( ! this.#p45.includes( card) ) {
			return 
		}

 g2( this.#p45, card );
		card.M133( false );
		this.#p46.innerHTML = this.#p45.length;
		this.M14();

		return card;
	}

/* ShowCounter */ M100 ( status ) {
		this.#p46.classList[ status ? "remove" : "add" ]( "Hidden" );
		if ( status ) {
			this.#p46.innerHTML = this.#p45.length;
		}
	}

/* SendCardsToPile */ M39 ( card_pile ) {
		

		var card;
		while ( this.#p45.length > 0 ) {
			card = this.#p45[ 0 ];
			this.M119( card );
			card_pile.M178( card );
		}
	}

/* GetClickTarget */ M47 () {
		return this.#p103.M113();
	}

/* ShuffleCards */ M83 () {
		if ( this.#p45.length > 1 ) {
 g6( this.#p45 );
			this.M72();
			this.M14();
		}
	}

/* Highlight */ M139 ( status ) {
		this.M113().classList[ status ? "add" : "remove" ]( "Highlight" );
	}

}

"use strict;"

/* CardsRow */
class E1 extends E3 {
/* #id */ #p110 = null;
/* #max_cards */ #p47 = 0;
/* #lst_cards */ #p45 = [];
/* #add_face_up */ #p28 = true;
	
	constructor ( id, max_cards, clickable = false ) {
		super( id, "row", "evenly", "center", true );

		this.#p110 = id;
		this.#p47 = max_cards;

		if ( clickable && this.M113() !== null ) {
			this.M113().classList.add( "Clickable" );
		}
	}

/* SetAddFaceUp */ M84 ( status ) {
		this.#p28 = status;
	}

/* AddCard */ M178 ( card, to_end = true ) {
		

		if ( this.#p45.length === this.#p47 ) {
			return 
		}
		if ( this.#p45.includes( card) ) {
			return 
		}

		card.M97( this );
		card.M132( this.#p28 );
		card.M135( 100 + this.#p45.length );

		if ( to_end ) {
			this.#p45.push( card );
		} else {
			this.#p45.unshift( card );
		}
		
		this.M131( card, to_end );

		return card;
	}

/* RemoveCard */ M119 ( card ) {
		

		if ( ! this.#p45.includes( card ) ) {
			return 
		}
		
 g2( this.#p45, card );
		this.M78( card );
		card.M69();

		return card;
	}

/* ClearCards */ M120 ( card_pile ) {
		
		
		var card;
		while ( this.#p45.length > 0 ) {
			card = this.#p45[ 0 ];
			this.M119( card );
			card_pile.M178( card );
		}
	}

/* GetFilteredCards */ M28 ( fn ) {
		return this.#p45.filter( fn );
	}

/* GetSelectedCards */ M29 () {

		return this.#p45.filter(
			card => card.M116()
		);
	}

/* UnselectSelectedCards */ M1 () {
		this.#p45.filter(
			card => card.M116()
		).forEach(
			card => card.M96( false )
		);
	}

/* GetNrCards */ M118 () {
		return this.#p45.length;
	}

/* GetCards */ M167 () {
		return g7( this.#p45 );
	}

/* IsFirstCard */ M101 ( card ) {
		

		if ( this.#p45.length === 0 ) {
			return false;
		}

		return ( this.#p45[ 0 ] === card );
	}

/* PeekFirstCard */ M73 () {
		if ( this.#p45.length === 0 ) {
			
			return null;
		}

		return this.#p45[ 0 ];
	}

/* GetFirstCard */ M85 () {
		if ( this.#p45.length === 0 ) {
			
			return null;
		}

		return this.M119( this.#p45[ 0 ] );
	}

/* IsEmpty */ M179 () {
		return ( this.#p45.length === 0 );
	}

	
/* IsFull */ M188 () {
		return ( this.#p45.length === this.#p47 );
	}
}

"use strict;"

/* Deck */
class C6 {
/* #lst_cards */ #p45 = [];
/* #lst_cards_out */ #p16 = [];
/* #nr_jokers */ #p48 = 0;
/* #total_cards */ #p29 = 0;
	
	constructor ( nr_jokers, discard_fn = null ) {
		this.#p48 = nr_jokers;

		this.#P30();

		if ( discard_fn !== null ) {
			this.DiscardCards ( discard_fn );
		}
	}

/* #MakeCards */ #P30 () {
		var card, id = 0;
		const LST_COLORS = [];
		var suit, value, color;
		for ( suit = 0; suit < 4; ++ suit ) {
			color = this.M87( suit );
			if ( ! LST_COLORS.includes( color ) ) {
				LST_COLORS.push( color );
			}
			for ( value = 2; value <= 14; ++ value ) {
				card = new E5(
					id ++,
					{ id: suit, symbol: this.M74( suit ), color: color },
					{ nr: value, symbol: this.M58( value ) }
					);
					this.#p45.push( card );
					this.#p29 += 1;
			}
		}
		var idx_color = 0, n;
		for ( n = 1; n <= this.#p48; ++ n ) {
			card = new E5(
				id ++,
				{ id: k37, symbol: this.M74( k37 ), color: LST_COLORS[ idx_color ] },
				{ nr: k31, symbol: this.M58( k31 ) }
			);
			
			this.#p45.push( card );
			this.#p29 += 1;

			idx_color = ( 1 + idx_color ) % LST_COLORS.length;
		}
	}

/* DiscardCards */ M86 ( fn ) {
		if ( this.#p16.length > 0 ) {
			
			return;
		}

		const lst_cards = this.#p45.filter( fn );

		

		this.#p29 -= lst_cards.length;
		
		lst_cards.forEach(
			card => {
 g2( this.#p45, card );
			}
		)

		

		return lst_cards;
	}

/* onResize */ f17 ( card_width, card_height ) {
		this.M102( card => card.M174( card_width, card_height ) );
	}

/* ForEachCard */ M102 ( fn ) {
		this.#p45.forEach( fn );
		this.#p16.forEach( fn );
	}

/* Shuffle */ M180 () {
 g6( this.#p45 );
	}

/* GetCard */ M181 () {
		if ( this.#p45.length === 0 ) {
			return null;
		}

		const CARD = g0( this.#p45 );
		this.#p16.push( CARD );
		
		return CARD;
	}

/* Reset */ M197 () {
		while ( this.#p16.length ) {
			this.#p45.push( this.#p16.pop() );
		}

		this.#p45.forEach( card => card.M197() );

		
	}

/* GetSuitSymbol */ M74 ( suit ) {
		return k47.filter( data => data.id === suit ).pop().symbol;
	}
	
/* GetSuitColor */ M87 ( suit ) {
		return k47.filter( data => data.id === suit ).pop().color;
	}
	
/* GetValueSymbol */ M58 ( value ) {
		if ( value === k31 || 11 <= value && value <= 13 || value === k45 ) {
			return k41.filter( data => data.value === value ).pop().symbol;
		}
		return value;
	}

/* SetCardsSize */ M88 ( card_width, card_height ) {
		this.M102(
			card => card.M174( card_width, card_height )
		);
	}

/* GetFilteredCards */ M28 ( fn ) {
		const lst_cards = this.#p45.filter( fn );
		
		lst_cards.forEach(
			card => {
 g2( this.#p45, card );
				this.#p16.push( card );
			}
		)

		return lst_cards;
	}

/* GetNrCards */ M118 () {
		return this.#p45.length;
	}

/* GetNrTotalCards */ M40 () {
		return this.#p29;
	}

/* GetRemainingCards */ M15 () {
		const lst_cards = [];
		var card;

		while ( this.#p45.length > 0 ) {
			var card = this.#p45.pop();
			this.#p16.push( card );
			lst_cards.push( card );
		}

		return lst_cards;
	}

}

/* Menu */
class C7 {
/* #element */ #p65 = null;
/* #icon */ #p104 = null;
	#lst_elements =null;

    constructor  ( element, icon ) {
        this.#p65 = element;
        this.#p104 = icon;

		this.#lst_elements = Array.from( element.children );
		
		this.#p104.classList.add( "Clickable" );

		this.#lst_elements.forEach(
			e => e.classList.add( "Clickable" )
		);
    }

/* GetElements */ M103 () {
		return g7( this.#lst_elements );
	}

/* Show */ M203 () {
		this.#p65.style.right = 0;
	}
    
/* Hide */ M204 () {
		this.#p65.style.right = ( -1.1 * this.#p65.offsetWidth ) + "px"
	}
    
/* Toggle */ M189 () {
		this.#p65.style.right === "0px"
			? this.M204()
			: this.M203();
	}

/* ShowIcon */ M169 ( status = true ) {
		this.#p104.classList[ status ? "remove" : "add" ]( "Hidden" );
	}

	IsIcon( e ) {
		return e.id.startsWith( "Menu" );
	}
	
/* EnablePlay */ M121 ( status ) {
 g13( "Menu_Play" ).classList[ status ? "remove" : "add" ]( "Hidden" );
	}

}

"use strict;"

/* Messenger */
class C1 {
/* #element */ #p65 = null;
/* #e_txt */ #p93 = null;
/* #e_OK */ #p105 = null;
/* #show_time */ #p49 = 0;
/* #timer */ #p94 = 0;
/* #alert */ #p95 = false;
	
	constructor ( show_time ) {
		this.#p65 = document.createElement( "div" );
		this.#p65.id = "Messenger";
		this.#p93 = document.createElement( "p" );
		this.#p65.appendChild( this.#p93 );
		this.#p105 = document.createElement( "div" );
		this.#p105.classList.add( "Clickable" );
		this.#p105.classList.add( "Hidden" );
		this.#p65.appendChild( this.#p105 );

		this.#p49 = ( show_time < 1E3 ? 1E3 * show_time : show_time );
	}

/* GetElement */ M113 () {
		return this.#p65;
	}

/* GetClickTarget */ M47 () {
		return this.#p105;
	}

/* onResize */ f17 ( width, height, top, left ) {
		this.#p65.style.width = width + "px";
		this.#p65.style.height = height + "px";
		this.#p65.style.left = left + "px";
		
		this.#p93.style.fontSize = Math.min(
			Math.round( height * 0.25 ),
			17
		) + "px";

		this.M204();
	}

/* Hide */ M204 () {
		if ( this.#p95 ) {
			
		}
		
		this.#p65.style.top = ( - 1.1 * this.#p65.offsetHeight ) + "px";
		
		if ( this.#p95 ) {
			this.#p95 = false;
			setTimeout(
				() => { this.#p105.classList.add( "Hidden" ) },
				500 
			);
		}
	}
	
/* ShowPrefixMessage */ M16 ( prefix, message ) {
		if ( this.#p49 > 0 ) {
			this.M104( "<span>" + prefix + "</span>: " + message );
		}
	}

/* ShowMessage */ M104 ( message ) {
		if ( this.#p95 ) {
			
			
			return;
		}

		if ( this.#p49 > 0 ) {
			clearTimeout( this.#p94 );
			this.#p94 = setTimeout( this.M204.bind( this ), this.#p49 );
			this.#p93.innerHTML = message;
			this.#p65.style.top = 0;
		}
	}
	
/* ShowForever */ M105 ( message ) {
		clearTimeout( this.#p94 );
		this.#p93.innerHTML = message;
		this.#p65.style.top = 0;
	}

/* Alert */ M198 ( message ) {
		clearTimeout( this.#p94 );
		this.#p95 = true;
		this.#p105.classList.remove( "Hidden" );
		this.M105( message );
	}
	
/* ClearAlert */ M122 () {
		if ( this.#p95 ) {
			this.#p95 = false;
			this.#p105.classList.add( "Hidden" );
			this.M204();
		}
	}

}

"use strict;"

/* PilesRow */
class E2 extends E3 {
/* #draw */ #p106 = null;
/* #discard */ #p70 = null;
/* #trophies */ #p60 = null;
	
	constructor () {
		super( "PilesRow", "column", "evenly", "center", true );
		this.#p106 = new E0( "Draw" );
		this.#p70 = new E0( "Discard" );
		this.#p60 = new E0( "Trophies" );

		this.#p106.M100( true );
		this.#p70.M100( true );
		this.#p60.M100( true );

		this.M131( this.#p106 );
		this.M131( this.#p70 );
		this.M131( this.#p60 );
	}

/* onResize */ f17 ( width, height, top, left, card_width, card_height ) {
		super.f17( width, height, top, left );
		this.M33( width, height / 3 );
		this.M2();

		this.M68(
			e => {
				if ( e instanceof E0 ) {
					e.M56( card_width, card_height );
				}
			}
		);
	}

/* GetDrawPile */ M106 () {
		return this.#p106;
	}

/* GetDiscardPile */ M59 () {
		return this.#p70;
	}

/* GetTrophiesPile */ M41 () {
		return this.#p60;
	}

/* GetElements */ M103 () {
		return [
			this.M113(),
			this.#p106.M113(),
			this.#p70.M113(),
			this.#p60.M113(),
			this.#p106.M54(),
			this.#p70.M54(),
			this.#p60.M54()
		];
	}

}

/* Stats */
class C4 {
/* #element */ #p65 = null;

/* #score */ #p96 = 0;
/* #nr_captures */ #p30 = 0;
/* #value_captures */ #p10 = 0;

    constructor  ( element ) {
        this.#p65 = element;
    }

/* Reset */ M197 () {
        this.#p96 = 0;
        this.#p30 = 0;
        this.#p10 = 0;

        this.#P28();
    }

/* Update */ M190 ( action_id, enemy_card, lst_hand_cards ) {
        if ( action_id === "cec" ) {
            this.#p96 += enemy_card.M159();
            if ( enemy_card.M79() ) {
                this.#p30 += 1;
                this.#p10 += enemy_card.M159();
            }
        } else if ( action_id === "ecc" || action_id === "stc" ) {
            lst_hand_cards.forEach(
                card => this.#p96 -= card.M159()
            );
        }

        this.#P28();
    }

/* #UpdateInfo */ #P28 () {
 g13( "txt_score" ).innerHTML = this.#p96;
 g13( "txt_nr_captures" ).innerHTML = this.#p30;
 g13( "txt_percent_captures" ).innerHTML = Math.round(
            this.#p10 / MAX_CAPTURES_VALUE * 100
        );
    }

/* GetScore */ M170 () {
        return this.#p96;
    }
}

"use strict;"

const k18 = -1;
const k48 = 0;
const k42 = 1;
const k34 = 2;
const k26 = 3;
const k27 = 4;
const k19 = 5;
const k15 = 6;
const k16 = 7;

const k28 = [
	{ id: "sacrifice", txt: "Sacrifice", cost: "cultist", code: k16 },
	{ id: "alignment_control", txt: "Alignment Control", cost: "R=2/4 D=5/10", code: k15 },
	{ id: "spirit_die", txt: "Spirit Die", cost: 2, code: k42 },
	{ id: "devils_luck", txt: "Devil's Luck", cost: 3, code: k34 },
	{ id: "time_shift", txt: "Time Shift", cost: 5, code: k26 },
	{ id: "grow_flesh", txt: "Grow Flesh", cost: 5, code: k27 },
	{ id: "buy_artifact", txt: "Buy Artifact", cost: 10, code: k19 }
];


/* Store */
class C5 {
/* #id */ #p110 = null;
/* #element */ #p65 = null;
/* #header */ #p79 = null;
/* #visible */ #p71 = true;
/* #reroll_available */ #p6 = 0;
/* #fn_update */ #p50 = null;
/* #requested_alignment */ #p0 = false;
/* #requested_sacrifice */ #p1 = false;
/* #use_blood */ #p44 = 0;
	
	constructor ( element, fnUpdate, use_blood ) {
		this.#p65 = element;
		this.#p110 = element.id;
		this.#p50 = fnUpdate;
		this.#p44 = use_blood;

		this.M140();

		
	}

/* GetItemName */ M107 ( item_code ) {
		const ITEM = this.#P16( item_code );
		return ITEM.txt.toUpperCase();
	}

/* onResize */ f17 ( width,  height, left ) {
		this.#p65.style.width = width + "px";
		this.#p65.style.height = height + "px";
		this.#p65.style.left = left + "px";
		this.#p65.style.fontSize = Math.round( width * 15E-3 ) + "px";
	}

/* MakeItems */ M140 () {
		this.#p79 = document.createElement( "header" );
		this.#p65.appendChild( this.#p79 );

		const lst = [
			{ id: "round", txt: "Round" },
			{ id: "attack*", txt: "Attack" },
			{ id: "injuries", txt: "Injuries" },
			{ id: "info", txt: "Info" }
		];

		if ( this.#p44 ) {
			lst.push( { id: "blood", txt: "Blood" } );
		}

		for ( var data of lst ) {
			var e = document.createElement( "span" );
			e.innerHTML = data.txt + ":";
			this.#p79.appendChild( e );
			e = document.createElement( "span" );
			e.id = "store_" + data.id
			e.classList.add( "StoreInfo" );
			this.#p79.appendChild( e );
		}

		var idx = 0;
 k28.forEach(
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

				this.#p65.appendChild( e );
			}
		);
	}

/* #UpdateInfo */ #P28 () {
		const data = this.#p50();

		for ( var k in data ) {
			var e = g13( "store_" + k );
			if ( e !== null ) {
				e.innerHTML = data[ k ];
			}
		}
 g13( "store_attack*" ).innerHTML = data.attack + "/" + data.attacking;
 g13( "store_info" ).innerHTML = data.dead.join( " " );

		return data.funds;
	}

/* GetClickTargets */ M42 () {
		return Array.from( g12( "div", this.#p65 ) );
	}
	
/* Show */ M203 () {
		this.#p71 = true;
		this.#p65.style.bottom = "";

		const funds = this.#P28();

 k28.forEach(
			item => {
				if ( typeof item.cost === "number") {
					const e = g11( "span", g13( item.id ) );
					const ok = ( item.cost <= funds );
					e.classList[ ok ? "remove" : "add" ]( "NoFunds" );
				}
			}
		);
	}
	
/* Hide */ M204 () {
		this.#p71 = false;
		this.#p65.style.bottom = ( - this.#p65.offsetHeight ) + "px";
	}

/* Toggle */ M189 () {
		if ( this.#p71 ) {
			this.M204();
		} else {
			this.M203();
		}
	}

/* TestItem */ M171 ( e_item, funds, blood ) {
		const item = k28[ e_item.dataset.idx ];

		
		
		
		
		
		
		if ( typeof item.cost === "number") {
			const diff = Math.max( 0, item.cost - funds );
			
			const BLOOD_COST = Math.round( Math.pow( this.#p44, diff ) );
			
			
			var STATUS;
			if ( this.#p44 ) {
				STATUS = BLOOD_COST <= blood;
			} else {
				STATUS = item.cost <= funds;
			}
			

			return {
				status: ( STATUS ? k48 : k18 ),
				item_code: item.code,
				item_cost: item.cost,
				blood_cost: BLOOD_COST,
				trophies_cost: item.cost - diff
			};
		}

		if ( item.code === k15 ) {
			this.#p0 = true;
			return { status: k48, item_code: k15 };
		}
		if ( item.code === k16 ) {
			this.#p1 = true;
			return { status: k48, item_code: k16 };
		}

		return null;
	}

/* GetBloodCost */ M89 ( item_cost, nr_trophies ) {
		return Math.pow( 2, Math.max( 0, item_cost - nr_trophies ) );
	}

/* GetSacrificeCost */ M30 ( card ) {
		return card.M159();
	}

/* GetAlignmentCost */ M31 ( action, upon_appearence ) {
		var cost = ( action === "reshuffle" ? 2 : 5 );

		if ( ! upon_appearence ) {
			cost *= 2;
		}

		return cost;
	}

/* #GetItemByCode */ #P16 ( code ) {
		const lst = k28.filter( item => item.code === code );
		
		if ( lst.length !== 1 ) {
			return null;
		}

		return lst.pop();
	}

/* GetItemCost */ M108 ( code ) {
		const item = this.#P16( code );
		
		if ( item !== null) {
			return item.cost;
		}

		return NaN;
	}

/* AddReroll */ M141 ( n = 1 ) {
		this.#p6 += n;
	}
	
/* IsRerollAvailable */ M17 () {
		return ( this.#p6 > 0 );
	}
	
/* HasAlignmentRequest */ M3 () {
		return this.#p0;
	}
	
/* HasSacrificeRequest */ M4 () {
		return this.#p1;
	}

/* UseReroll */ M142 () {
		if ( this.#p6 === 0 ) {
			return;
		}

		this.#p6 -= 1;
		this.M203();
	}

/* ClearSacrifice */ M60 () {
		this.#p1 = false;
	}

/* UseSacrifice */ M90 () {
		if ( ! this.#p1 ) {
			return;
		}

		this.#p1 = false;
	}

/* ClearAlignment */ M61 () {
		this.#p0 = false;
	}

/* UseAlignment */ M91 () {
		if ( ! this.#p0 ) {
			return;
		}

		this.#p0 = false;
	}

}

"use strict;"

/* Cult */
class E6 extends E3 {
/* #id */ #p110 = null;

/* #element */ #p65 = null;
/* #planet */ #p80 = null;
/* #horror */ #p81 = null;
/* #cultists */ #p61 = null;
/* #planet_round */ #p23 = 0;
/* #under_attack */ #p24 = false; 
/* #dead_cultists */ #p18 = 0;
	
	constructor ( id ) {
		super( "Cult_" + id, "row", "start", "center", true );

		this.#p110 = id;

		this.#p65 = this.M113();
		this.#p65.classList.add( "Cult" );
		this.#p65.classList.add( "Cult_" + id );

		this.#p80 = new E1( "Planet_" + id, 1 );
		this.#p81 = new E1( "Horror_" + id, 1 );
		this.#p61 = new E1( "Cultists_" + id, k20 + k23 );
		this.#p61.M34(
			( c1, c2 ) => c2.M159() - c1.M159()
		);
		
		this.#p80.M113().classList.add( "Planet" );
		this.#p81.M113().classList.add( "Horror" );
		this.#p61.M113().classList.add( "Cultists" );

		this.M131( this.#p80 );
		this.M131( this.#p81 );
		this.M131( this.#p61 );
	}

/* GetId */ M195 () {
		return this.#p110;
	}

/* onResize */ f17 ( width, height, top, left, cell_width ) {

		this.#p80.M174( cell_width, height );
		this.#p81.M174( cell_width, height );
		this.#p61.M174( width - 2 * cell_width, height );

		super.f17( width, height, top, left );

		[ this.#p80, this.#p81, this.#p61 ].forEach(
			card_row => card_row.M2()
		);
	}

/* GetElements */ M103 () {
		return [
			this.#p65,
			this.#p80.M113(),
			this.#p81.M113(),
			this.#p61.M113()
		];
	}

/* GetPlanet */ M143 () {
		return this.#p80;
	}

/* GetHorror */ M144 () {
		return this.#p81;
	}

/* GetCultists */ M109 () {
		return this.#p61;
	}
	
/* HasCultists */ M110 () {
		return this.#p61.M118() > 0;
	}
	
/* HasMaxCultists */ M62 () {
		return this.#p61.M118() >= k23;
	}
	
/* GetNrCultists */ M75 () {
		return this.#p61.M118();
	}

/* SelectCultists */ M63 ( status ) {
		this.#p61.M167().forEach( card => card.M96( status ) );
	}

/* GetPlanetRound */ M64 () {
		return this.#p23;
	}

/* ClearCards */ M120 ( card_pile ) {
		this.#p80.M120( card_pile );
		this.#p81.M120( card_pile );
		this.#p61.M120( card_pile );
	}

/* AddCultist */ M123 ( card ) {
		
		
		
		this.#p61.M178( card );

		this.#P13();
		
		return card;
	}

/* Reset */ M197 () {
		this.#p61.M113().classList.remove( "MaxCultists" );
		this.#p18 = 0;
	}

/* #TestMaxCultists */ #P13 () {
		const E = this.#p61.M113();
		if ( this.M62() ) {
			E.classList.add( "MaxCultists" );
		} else {
			E.classList.remove( "MaxCultists" );
		}
	}
	
/* AddHorror */ M145 ( card ) {
		
		
		
		return this.#p81.M178( card );
	}

/* AddPlanet */ M146 ( card, round ) {
		
		
		this.#p80.M178( card );
		this.#p23 = round;
		card.M136( true );
	}

/* ClearPlanetMarker */ M18 () {
		if ( this.#p80.M118() > 0 ) {
			this.#p80.M73().M136( false );
		}
	}

/* RemoveCard */ M119 ( card ) {
		
		

		if ( card.M201( this.#p61) ) {
			
			this.#P17( card );
		} else if ( card.M201( this.#p81 ) ) {
			
			this.#P23( card );
		} else if ( card.M201( this.#p80 ) ) {
			
			this.#P22( card );
		} else {
			
		}

		return card;
	}

/* #RemoveCultist */ #P17 ( card ) {
		
		
		
		this.#p61.M119( card );
		this.#P13();
		this.#p18 += 1;
		return card;
	}

/* #RemovePlanet */ #P22 () {
		if ( ! this.#p80.M179() ) {
			this.#p23 = 0;
			return this.#p80.M85();
		}

		return null;
	}

/* #RemoveHorror */ #P23 () {
		if ( ! this.#p81.M179() ) {
			return this.#p81.M85();
		}

		return null;
	}

/* HasPlanet */ M147 () {
		return this.#p80.M118() > 0;
	}

/* HasHorror */ M148 () {
		return this.#p81.M118() > 0;
	}

/* HasTargets */ M124 () {
		return this.M148() || this.M110();
	}

/* PeekHorror */ M125 () {
		return this.#p81.M73();
	}

/* SetUnderAttack */ M65 ( status ) {
		this.#p24 = status;

		function SetAttack( entity, status ) {
			entity.M113().classList[ status ? "add" : "remove" ]( "CultUnderAttack" );
		}
		SetAttack( this.#p81, status );
		SetAttack( this.#p61, status );
	}

/* GetNrDeadCultists */ M19 () {
		return this.#p18;
	}

}

"use strict;"

/* Die */
class E7 extends C0 {
/* #id */ #p110 = null;
/* #element */ #p65 = null;
/* #e_body */ #p75 = null;
/* #e_reroll */ #p62 = null;
/* #selected */ #p53 = false;
/* #value */ #p87 = 0;
/* #reroll */ #p82 = false;
/* #rolling */ #p72 = false;
/* #disabled */ #p63 = false;
/* #nr_rerolls */ #p32 = 0;
/* #used */ #p107 = false;
/* #temp */ #p108 = false;

/* #prism */ #p97 = null;
	
	constructor ( id ) {
		super( "Die_" + id, true );

		this.#p110 = id;

		this.#p97 = new C3( 6, 0, 0);
		this.#p97.M35().forEach(
			face => {
				const n = 1 + this.#p97.GetFaceIdx( face );
				face.innerHTML = n;
				if ( n === 1 ) {
					face.classList.add( "IsOne" );
				}
			}
		);
		this.#p97.M46( 300 );
		this.prism = this.#p97; 

		this.#p65 = this.M113();
		this.#p65.classList.add( "Die" );
		
		
		this.#p75 = document.createElement( "div" );
		this.#p75.classList.add( "DieBody" );
		this.#p75.classList.add( "Clickable" );
		this.#p75.dataset.id = id;
		
		this.#p75.appendChild( this.#p97.M113() );
		
		this.#p62 = document.createElement( "p" );
		this.#p62.classList.add( "Clickable" );
		this.#p62.dataset.id = id;
		
		this.#p65.appendChild( this.#p75 );
		this.#p65.appendChild( this.#p62 );
	}

/* SetSize */ M174 ( width, height ) {
		super.M174( width, height );
		this.M126();
	}

/* SetBoxSize */ M126 () {
		if ( this.#p75.offsetHeight === 0 ) {
			return 
		}
		
		const SZ = Math.round( this.#p75.offsetHeight * 0.85 );

		this.#p75.style.fontSize = Math.round( SZ * 0.5 ) + "px";
		this.#p62.style.fontSize = Math.round( SZ * 0.33 ) + "px";
		this.#p97.M174( SZ, SZ );
	}

/* GetId */ M195 () {
		return this.#p110;
	}

/* GetClickTarget */ M47 () {
		return this.#p75;
	}
	
/* GetClickTargets */ M42 () {
		return [ this.#p75, this.#p62 ];
	}

/* ToggleSelected */ M48 () {
		this.M96( ! this.#p53 );
	}

/* IsSelected */ M116 () {
		return this.#p53;
	}

/* SetSelected */ M96 ( status ) {
		if ( status && this.#p107 ) {
			return;
		}
		this.#p53 = status;
		this.#p75.classList[ status ? "add" : "remove" ]( "Selected" );
	}
	
/* SetUsed */ M182 ( status ) {
		if ( status ) {
			this.M96( false );
			this.M149( false );
		}
		this.#p107 = status;
		this.#p75.classList[ status ? "add" : "remove" ]( "Used" );

		return this;
	}

/* IsUsed */ M191 () {
		return this.#p107;
	}

/* SetReroll */ M149 ( status ) {
		this.#p82 = status;
		this.#p62.classList[ status ? "remove" : "add" ]( "Hidden" );
		this.#p62.innerHTML = ( status ? "&larr; &rarr;" : "" );
	}

/* Roll */ M205 () {
		if ( ! this.M183() ) {
			
			return Promise.reject( 0 );
		}

		this.#p62.innerHTML = "";
		this.#P18( false );

		this.#p72 = true;
		this.#p87 = 0;

		return new Promise(
			( resolve, _ ) => {
					this._Roll( 1, resolve );
			}
		);
	}

	_Roll ( nr_roll, resolve ) {
		this.#p97.M45( true );

		if ( nr_roll === 1 || nr_roll < 6 ) {
			nr_roll += 1;
			setTimeout( this._Roll.bind( this, nr_roll, resolve ), k13 );
		} else {
			this.#p72 = false;
			this.#p87 = 1 + this.#p97.M156();
			
			setTimeout(
				() => {
					this.#P18( true );
					resolve( this.#p87 );
				},
 k13
			);
		}
	}

/* #MarkFrontFace */ #P18 ( status ) {
		this.#p97.M35().forEach(
			face => {
				if ( status ) {
					if ( this.#p97.GetFaceIdx( face ) !== this.#p87 - 1 ) {
						face.classList.add( "NotFront" );
					}
				} else {
					face.classList.remove( "NotFront" );
				}
			}
		);
	}

/* Reroll */ M192 () {
		if ( ! this.M150() ) {
			
			return Promise.reject( 0 );
		}

		this.#p32 += 1;
		
		this.M149( false );

		return this.M205();
	}

/* Reset */ M197 ( keep_temp_status = false ) {
		this.#p87 = 0;
		this.#p32 = 0;
		this.#p72 = false;
		
		this.M149( false );
		this.M96( false );
		this.M111( false );
		this.M182( false );
		this.M184( keep_temp_status ? this.#p108 : false );
	}

/* GetValue */ M159 () {
		return this.#p87;
	}

/* SetDisabled */ M111 ( status = true ) {
		this.#p63 = status;
		this.#p65.classList[ status ? "add" : "remove" ]( "Disabled" );
	}

/* CanRoll */ M183 () {
		return ! (
			this.#p63 || this.#p53 || this.#p72 || this.#p107
		);
	}

/* CanReroll */ M150 () {
		return this.M183() && this.#p82;
	}

/* HasRerolled */ M112 () {
		return this.#p32 > 0;
	}

/* SetTemp */ M184 ( status ) {
		this.#p108 = status;
		this.#p62.classList[ status ? "add" : "remove" ]( "Temp" );
	}

/* IsTemp */ M193 () {
		return this.#p108;
	}

}

"use strict;"

/* DiceRow */
class E4 extends E3 {
/* #lst_dice */ #p64 = [];
/* #start_dice */ #p33 = 0;
/* #lst_extra_dice */ #p11 = [];
/* #lst_spirit_dice */ #p8 = [];
/* #lst_dead_dice */ #p19 = [];
/* #die_id */ #p83 = 0;

/* #on_new_die */ #p34 = null;
/* #die_width */ #p51 = 0;
/* #die_height */ #p35 = 0;
	
	constructor ( start_dice, on_new_die ) {
		super( "DiceRow", "column", "evenly", "center", true );

		this.#p33 = start_dice;
		this.#p34 = on_new_die;

		for ( var die, n = 0; n < start_dice; ++ n ) {
			this.M194( new E7( n ) );
		}
		
		this.#p83 = start_dice;

		this.M92( true );
	}

/* onResize */ f17 ( width, height, top, left, box_width, box_height ) {
		this.#p51 = box_width;
		this.#p35 = box_height;
		this.M33( this.#p51, this.#p35 );
		super.f17( width, height, top, left );
	}

/* GetElements */ M103 () {
		const lst = this.#p64.map( d => d.M113() );
		lst.push( this.M113() );
		return lst;
	}

/* GetClicktargets */ M43 () {
		var lst = []; 
		
		this.#p64.forEach( d => lst = lst.concat( d.M42() ) );
		
		return lst;
	}

/* GetDieById */ M127 ( id ) {
		const lst = this.#p64.filter(
			die => die.M195() === id
		);
		
		if ( lst.length === 1 ) {
			return lst[ 0 ];
		}

		return null;
	}

/* GetDieByClickTarget */ M5 ( tgt ) {
		return this.#p64[ parseInt( tgt.dataset.id, 10 ) ]
	}

/* Reset */ M197 () {
		this.M67();
		while ( this.#p19.length > 0 ) {
			this.M155();
		}
		while ( this.#p64.length > this.#p33 ) {
			this.M152( false ); 
		}
		
		
		
		this.M172();
	}
	
/* ResetDie */ M172 () {
		this.#p64.forEach(
			die => {
				die.M197( true ); 
			}
		);
	}

/* Roll */ M205 () {
		const lst = [];
		this.#p64.forEach(
			die => {
				if ( ! die.M191() ) {
					lst.push( die.M205() )
				}
			}
		);

		return Promise.all( lst ).then(
			_ => {
				this.#p64.forEach(
					d => {
						d.M149( d.M159() !== 1 );
					}
				);
				return Promise.resolve( this.M76() );
			}
		);
	}

/* GetDiceValues */ M76 () {
		var lst = [];
		
		this.#p64.forEach(
			die => {
				if ( ! die.M191() ) {
					lst.push(
						{ id: die.M195(), value: die.M159() }
					);
				}
			}
		);
		
		return lst;
	}

/* AddTempDie */ M128 () {
		const die = this.M151();
		this.#p8.push( die );
		die.M182( false );
		die.M184( true );
		return die;
	}

/* AddNewDie */ M151 () {
		

		var die;
		
		if ( this.#p11.length > 0 ) {
			die = this.#p11.pop();
			
		} else {
			die = new E7( ++ this.#p83 );
			this.#p34( die );
		}

		die.M111( false ); 
		die.M174( this.#p51, this.#p35 );

		return this.M194( die ); 
	}

/* AddDie */ M194 ( die ) {
		

		this.M131( die );
		this.#p64.push( die );
		die.M197();

		return die;
	}

/* RemoveDie */ M152 ( dead = true ) {
		if ( this.#p64.length === 0 ) {
			
			return -1;
		}

		const die = this.#p64.shift();
		
		die.M111( true );
		this.M78( die );

		if ( dead ) {
			this.#p19.push( die );
		} else {
			this.#p11.push( die );
		}

		return this.#p64.length;
	}

/* GetSelectionValues */ M10 () {
		const lst = [];
		
		this.#p64.forEach(
			die => {
				if ( die.M116() ) {
					lst.push( die.M159() );
				}
			}
		);
		
		

		return lst;
	}

/* TestSingle */ M129 ( lst_dice_values, card_value ) {
		if ( lst_dice_values.length !== 1 ) {
			return false;
		}

		return ( lst_dice_values[ 0 ] >= card_value );
	}

/* IsMatch */ M185 ( lst_dice_values ) {
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

/* IsRun */ M199 ( lst_dice_values ) {
		if ( lst_dice_values.length < 3 ) {
			return false;
		}

		const lst = g7( lst_dice_values ).sort();

		var i1, i2;
		for ( i1 = 0, i2 = 1; i2 < lst.length; ++i1, ++i2 ) {
			if ( lst[ i1 ] + 1 !== lst[ i2 ] ) {
				return false;
			}
		}

		return true;
	}

/* TestMatch */ M153 ( lst_dice_values, card_value ) {
		const FACE = this.M185( lst_dice_values );
		if ( FACE === 0 ) {
			return false;
		}
		
		return ( FACE * lst_dice_values.length >= card_value );
	}

/* SumValues */ M154 ( lst_dice_values ) {
		return lst_dice_values.reduce(
			( accumulator, current_value ) => accumulator + current_value,
			0
		);
	}

/* TestRun */ M186 ( lst_dice_values, card_value ) {
		if ( ! this.M199( lst_dice_values ) ) {
			return false;
		}
		
		return ( this.M154( lst_dice_values ) >= card_value );
	}
	
/* TestPrecision */ M77 ( lst_dice_values, card_value ) {
		return this.M154( lst_dice_values ) === card_value;
	}

/* SetAllAsUsed */ M92 ( status ) {
		this.#p64.forEach(
			die => {
				die.M182( status );
			}
		);
	}
	
/* SetAllRoroll */ M93 ( status ) {
		this.#p64.forEach(
			die => {
				die.M149( status );
			}
		);
	}
	
/* SetSelectionUsed */ M32 () {
		this.#p64.forEach(
			die => {
				if ( die.M116() ) {
					die.M182( true );
				}
			}
		);
	}

/* UnSelectSelectedDie */ M6 () {
		this.#p64.forEach(
			die => {
				if ( die.M116() ) {
					die.M96( false );
				}
			}
		);
	}

/* AllDieWereUsed */ M66 () {
		var status = true;

		this.#p64.forEach(
			die => {
				if ( ! die.M191() ) {
					status = false;
				}
			}
		);

		return status;
	}

/* RemoveTempDies */ M67 () {
		var die;

		while ( this.#p8.length > 0) {
			die = this.#p8.pop();
			
			let d = g2( this.#p64, die );
			
			this.#p11.push( die );
			this.M78( die );
			die.M111( true );
		}
	}

/* ReviveDie */ M155 () {
		if ( this.#p19.length === 0 ) {
			
			return null;
		}

		return this.M194( this.#p19.pop() );
	}

/* NrDeadDice */ M130 () {
		return this.#p19.length;
	}
}

"use strict;"
const k10 = 14 / 10;

const k43 = 5;
const k44 = 0;

const k8 = 0; 

const k4 = 0.25; 
const k0 = 0.66; 
const k1 = 0.25; 
const DrawCardsToCardRow_TIME_FACTOR = 1; 

const k13 = g8( "DICE_ROTATE_TIME", true );
const k6 = g8( "CARD_TRANSLATE_TIME", true );

const k49 = 4;
const k23 = 5;
const k20 = 2;
const k21 = 3;
const k11 = 3;
const k24 = 3;
const k50 = -1;

const k35 = 0;
const k12 = 1;
const k17 = 2;
const k25 = 3;

const k9 = 0;
const k14 = 1;

const k5 = 0;
const k2 = 1;
const k3 = 2;
const k7 = 3;

const k29 = 0;
const k30 = 1;
const k22 = 2;
const k36 = 3;
const k37 = 4;
const k38 = [ "hearts", "spades", "diamonds", "clubs", "joker" ];

const k31 = 0;
const k39 = 11;
const k32 = 12;
const k40 = 13;
const k45 = 14;

const k46 = "Red";
const k33 = "Black";

const k47 = [
	{ id: k29,		symbol: "&hearts;",	color: k46 },
	{ id: k30,		symbol: "&spades;",	color: k33 },
	{ id: k22,	symbol: "&diams;",	color: k46 },
	{ id: k36,		symbol: "&clubs;",	color: k33 },
	{ id: k37,		symbol: "",	color: "" }
];

const k41 = [
	{ value: k39, symbol: "J" },
	{ value: k32, symbol: "Q" },
	{ value: k40, symbol: "K" },
	{ value: k45, symbol: "A" },
	{ value: k31, symbol: "&#x2605;" }
];

"use strict;"

window.addEventListener(
	"load",
	() => {
 new C2();
	}
);

