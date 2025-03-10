// Toggle class menu
$(function () {
    $('.menu').on('click', function () {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            $('.ss-menu1').addClass('visible1');
            $('.ss-menu2').addClass('visible2');
            $('.ss-menu3').addClass('visible3');
            $('.ss-menu4').addClass('visible4');
            $('.ss-menu5').addClass('visible5');
        } else {
            $('.ss-menu1').removeClass('visible1');
            $('.ss-menu2').removeClass('visible2');
            $('.ss-menu3').removeClass('visible3');
            $('.ss-menu4').removeClass('visible4');
            $('.ss-menu5').removeClass('visible5');
        }
    })
})
$(function () {
    $('.ss-menu').on('click', function () {
      $('.menu').removeClass('active');
      $('.ss-menu1').removeClass('visible1');
      $('.ss-menu2').removeClass('visible2');
      $('.ss-menu3').removeClass('visible3');
      $('.ss-menu4').removeClass('visible4');
      $('.ss-menu5').removeClass('visible5');
    })
})
$(function () {
    $(window).on('scroll', function () {
        if ($('.menu').hasClass('active')) {
          $('.menu').removeClass('active');
          $('.ss-menu1').removeClass('visible1');
          $('.ss-menu2').removeClass('visible2');
          $('.ss-menu3').removeClass('visible3');
          $('.ss-menu4').removeClass('visible4');
          $('.ss-menu5').removeClass('visible5');
        }
    })
})

// Parallax effect and gsap
$(function () {
  if (!window.location.pathname.match("mentions")) {
    $('.rellax').css('transform', 'translateX(-50%)');
    var rellax = new Rellax('.rellax');
  }
})

// Script adresse Email
// Listener pour chargement adresse mailto
window.addEventListener("load", function () {
  if (document.getElementById('insertMail')) {
    let name = "monkeebusinessband";
    let domain = "gmail.com";
    let subject = "subject=Monkee Business Band";
    let divMail = document.getElementById('insertMail');
    let newAhref = document.createElement('a');
    newAhref.href = "mailto:" + name + '@' + domain + "?" + subject;
    newAhref.innerHTML = name + '@' + domain;
    divMail.appendChild(newAhref);
  }
})

// Manage video
$(function () {
    $('video').on('click', function(event) {
      event.preventDefault();
      document.getElementById('tucoVideo').play();
    });
})

// Manage form
$(function () {
    // Name
      $('#name').on('blur input', function () {
        if ($('#name').val().length >= 50) {
          $('#helpName').text('50 characters max').hide().show();
        } else {
          $('#helpName').slideUp(400);
        }
      })
    // Email
        $('#mail').on('blur input', function () {
          let regexMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
          let mailEntry = $('input#mail').val();
          if (!mailEntry.match(regexMail)) {
            $('#helpMail').text('Incorrect email address').hide().show();
          } else {
            $('#helpMail').slideUp(400);
          }
        })
    // Check Robot
        $('#checkRobot').on('blur input', function () {
            if ($('#checkRobot').val() != 7) {
              $('#helpRobot').text('Incorrect result of the operation').hide().show();
            } else {
              $('#helpRobot').slideUp(400);
            }
        })
    // Message
        $('#message').on('blur input', function () {
          if ($('#message').val().length >= 3000) {
              $('#helpMessage').text('Your message must not exceed 3000 characters').hide().slideDown(400);
          } else {
            $('#helpMessage').slideUp(400);
          }
        })
  })

// Form newsletter input blur
$(function () {
  let regexMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    $('#emailNews').on('blur input', function(event) {
        //event.preventDefault();
        let mailEntry = $('#emailNews').val();
        if (!mailEntry.match(regexMail)) {
          $('#helpMailNews').text('Incorrect email address').hide().show();
          $('#hideNews').hide();
        } else {
          $('#helpMailNews').slideUp(100, function () {
            // Apparition checkRobotNews
            $('#hideNews').fadeIn();
          });
        }
    });
    $('#checkRobotNews').on('blur input', function(event) {
        if ($('#checkRobotNews').val() != 7) {
          $('#helpMailNews').text('Incorrect result').hide().show();
        } else {
          $('#helpMailNews').slideUp(100, function () {
          });
        }
    });
})

// Animations on scroll
$(function () {
    $(window).on('scroll', function () {
        let sizePage = $(window).height();
        let trigger = 100;
        // Animation en Y
        let element = document.getElementsByClassName('animatableY');
        for (var unit of element) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }

        // Animation en X
        let elementh2 = document.getElementsByClassName('animatableX');
        for (var unit of elementh2) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }

        // Animation opacity
        let elementOpacity = document.getElementsByClassName('animatableOpacity');
        for (var unit of elementOpacity) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }
    })
})

//Lazyload
$(function () {
  if (!window.location.pathname.match("mentions")) {
    lazyload();
  }
})

// resize reload
$(function () {
  let initialWidth = $(window).innerWidth();
  $(window).on('resize', function () {
    let newWidth = $(window).innerWidth();
    if (initialWidth != newWidth) {
      document.location.reload(true);
    }
  })
})

// Manage scroll up button
$(function () {
    let ecran = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      $(window).on('scroll', function () {
        let scrollNow = $(window).scrollTop();
        $(window).on('scroll', function functionName() {
          if (scrollNow > 600 && scrollNow > $(window).scrollTop()) {
            if ($('#upArrow').is(":hidden")) {
              $('#upArrow').show();
            }
          } else {
            $('#upArrow').hide();
          }
        })
        $('#upArrow').on('click', function () {
            $(window).scrollTop(0);
        })
      })
})

// Delete scroll tag on scroll down
$(function () {
    $(window).on('scroll', function () {
        let topPage = $(window).scrollTop();
        if (topPage >= 150) {
          $('#scrollDown').hide();
        } else {
          $('#scrollDown').show();
        }
    })
})
// Manage tag scroll down
$(function () {
    $('#scrollDown').on('click', function() {
      window.location.href = "#nextShow";
    });
})

// Locations
$(function () {
  $(".card.gerald").on('click', () => {
    window.open("https://www.instagram.com/geraldtodd5249/", '_blank');
  });
})
// Location socials
$(function () {
  $('.facebook').on('click', function(event) {
    event.preventDefault();
    window.open("https://www.facebook.com/monkeebusinessband/", '_blank');
  });
  $('.instagram').on('click', function(event) {
    event.preventDefault();
    window.open("https://www.instagram.com/monkeebusinessband/", '_blank');
  });
})

$(document).ready(function() {
  // If the URL has a hash on load, scroll to the target section
  if (window.location.hash) {
    var target = $(window.location.hash);
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 600, function() {
        target.addClass('showed');
        target.find('.animatableY, .animatableX, .animatableOpacity').addClass('showed');
      });
    }
  }

  // Override default behavior for all anchor links starting with #
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    var target = $(this.hash);
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 600);
      // Update the URL hash without jump
      history.pushState(null, null, this.hash);
    }
  });
});
