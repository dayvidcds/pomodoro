/*
 * The Final Countdown - jQuery Countdown Timer
 * http://github.com/paulelliott/jquery-the_final_countdown
 * Copyright (c) 2009 Paul Elliott (paul@codingfrontier.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 *
 * Added resetTimer function to enable timer resets. - Pratik Desai - desai@pratyk.com
 */
 
(function($) {
  function configuration(user_settings) {
    //Override the default settings with the user settings
    return $.extend({
      time_in_seconds: 3600,
      time_format: 'MM:ss',
      tick: function(timer, time_in_seconds, formatted_time) {
      document.title = '(' + formatted_time + ')' + ' TomatoTimer';
      },
      buzzer: function(timer) {
      document.title = 'Buzzzzz!';
      // desktopAlert();
      buzzer();
	 },
      autostart: false
    }, user_settings);
  }

  $.fn.extend({
    createTimer: function(user_settings) {
      var settings = configuration(user_settings);
      var timer_local = false;
      var timers = this;

      timers.text(timeRemainFormat(settings.time_in_seconds)).
      // timers.text(dateFormat(new Date(settings.time_in_seconds * 1000), settings.time_format)).
        data('countdown.duration', settings.time_in_seconds * 1000).
        data('countdown.state', 'ready').
        data('countdown.timer_id', new Date().getTime());

      if (settings.autostart) {
        this.startTimer(settings);
      }

      return this;
    },

    startTimer: function(user_settings) {
      var settings = configuration(user_settings);
      var my_state = this.data('countdown.state');
      return this.each(function() {
        // check if it's already running
        if (my_state == 'running') {
            // console.log('already running');
            return;
        }

        var timer = $(this).data('countdown.state', 'running');
        var timerId = timer.data('countdown.timer_id');
        
        var end_time = new Date().getTime() + timer.data('countdown.duration');

        var interval = setInterval(function() {
          if (timerId == timer.data('countdown.timer_id') && timer.data('countdown.state') == 'running') {
          
            var current_time = Math.round((end_time - new Date().getTime()) / 1000);
            
            if (current_time <= 0) {
              clearInterval(interval);
              current_time = 0;
            }
			
            timer.data('countdown.duration', current_time * 1000);
            var formatted_time = timeRemainFormat(current_time);
            // var formatted_time = dateFormat(new Date(current_time * 1000), settings.time_format);
            timer.text(formatted_time);
            settings.tick(timer, current_time, formatted_time);

            //If the timer completed, fire the buzzer callback
            current_time == 0 && settings.buzzer(timer);
          } else {
            clearInterval(interval);
          }
        }, 1000);
      });
    },

    resetTimer: function(user_settings) {
      var settings = configuration(user_settings);
      document.title = "TomatoTimer";
      var timers = this;
      timers.text(timeRemainFormat(settings.time_in_seconds)).
      // timers.text(dateFormat(new Date(settings.time_in_seconds * 1000), settings.time_format)).
        data('countdown.duration', settings.time_in_seconds * 1000).
        data('countdown.state', 'ready').
        data('countdown.timer_id', new Date().getTime());

      /* UnComment if you wish to reset the timer and make it start from rollback (if autostart = true). 

      if (settings.autostart) {
        this.startTimer(settings);
      }

      */

      return this;
    },
    

    pauseTimer: function() {
    return this.data('countdown.state', 'paused');
    }
  });


  var timeRemainFormat = function() {
    return function (seconds) {
        // console.log(seconds);
        var min = Math.floor(seconds / 60);
        var secs = seconds - (min * 60);

        return ('0' + min).slice(-2) + ':' + ('0' + secs).slice(-2);
    }
  }();

  /*
   * Date Format 1.2.3
   * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
   * MIT license
   * Includes enhancements by Scott Trenda <scott.trenda.net>
   * and Kris Kowal <cixar.com/~kris.kowal/>
   * http://blog.stevenlevithan.com/archives/date-time-format
   * Accepts a date, a mask, or a date and a mask.
   * Returns a formatted version of the given date.
   * The date defaults to the current date/time.
   * The mask defaults to dateFormat.masks.default.
   */

  var dateFormat = function () {
    var  token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
      timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
      timezoneClip = /[^-+\dA-Z]/g,
      pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
      };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
      // console.log(date);
      var dF = dateFormat;

      // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
      if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date;
      if (isNaN(date)) throw SyntaxError("invalid date");

      mask = String(dF.masks[mask] || mask || dF.masks["default"]);

      // Allow setting the utc argument via the mask
      if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
      }

      var  _ = utc ? "getUTC" : "get",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dF.i18n.dayNames[D],
          dddd: dF.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dF.i18n.monthNames[m],
          mmmm: dF.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(L > 99 ? Math.round(L / 10) : L),
          t:    H < 12 ? "a"  : "p",
          tt:   H < 12 ? "am" : "pm",
          T:    H < 12 ? "A"  : "P",
          TT:   H < 12 ? "AM" : "PM",
          Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
          o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };

      return mask.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
    };
  }();

  // Some common format strings
  dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
  };
})(jQuery);
