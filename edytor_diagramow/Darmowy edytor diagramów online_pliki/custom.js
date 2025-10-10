(function ($) {
                
    // Navigation scrolls
    $(".navbar-nav li a").on('click', function(event) {
        $('.navbar-nav li').removeClass('active');
        $(this).closest('li').addClass('active');
        var $anchor = $(this);
        var nav = $($anchor.attr('href'));
        if (nav.length) {
        $('html, body').stop().animate({				
            scrollTop: $($anchor.attr('href')).offset().top				
        }, 1500, 'easeInOutExpo');
        
        event.preventDefault();
        }
    });
    
    // Add smooth scrolling to all links in navbar
    $("a.mouse-hover, a.get-quote").on('click', function(event) {
      var hash = this.hash;
      if( hash ) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $(hash).offset().top
        }, 1500, 'easeInOutExpo');
      }
    });
})(jQuery);

// Initialize affix and add an offset to add affix class on scroll
$('#mainNav').affix({
  offset: {
    top: 100
  }
})

function getTimeZone() {
	var tzo=(new Date().getTimezoneOffset()/60)*(-1);
	var prefix = "GMT ";
	if (tzo >= 0) {
  	prefix += "+";
	}
	tzo = prefix + tzo;
	return tzo;
}

function setCookie(name, value, expires, path, domain, secure) {
	if (expires==undefined) {
		expires = new Date(new Date().getTime() + (1000*60*60*24 *90));
	}
	if (path==undefined) {
		path = "/";
	}
    document.cookie= name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else { begin += 2; }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) { end = dc.length; }
    return unescape(dc.substring(begin + prefix.length, end));
}

function removeCookie(name) {
	var date = new Date();
	date.setTime(date.getTime()+(-1*24*60*60*1000));
	setCookie(name, "", date, "/");
}