(function() {
  var isPlaying = false; var totalTime = 0; var timePassed = 0;
  var BOPTime = 0;

  function fetchDetails(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          if(response.is_playing && response.currently_playing_type != 'ad'){

            if($('.muzieknootjes').css('display') == 'none'){
                $('.muzieknootjes').fadeIn();
            }

            $('img#martyFace').css({
              'animation-duration':BOPTime+'s',
              'animation-play-state':'running'
            });

            isPlaying = true;

            if(response.item != null){
              song = response.item.name;
              artist = response.item.artists[0].name;
              albumArt = response.item.album.images[0].url;
              console.log('Playing song '+song+' by '+artist);
            }

            //if new song is playing
            if((currentSong != song || currentArtist != artist)
              || (currentSong == "" && currentArtist == "")){

                var trackID = response.item.id;
              $.ajax({
                  url: 'https://api.spotify.com/v1/audio-features/'+trackID,
                  headers: {
                    'Authorization': 'Bearer ' + access_token
                  },
                  success: function(response2) {
                    //todo: code here about setting tempo
                    BOPTime = 60/(response2.tempo*2);
                    console.log('BOP time fetched as '+BOPTime);
                    $('img#martyFace').css({
                      'animation-duration':BOPTime+'s',
                      'animation-play-state':'running'
                    });
                  }
                });

                currentSong = song;
                currentArtist = artist;
              }
          }
          //if response says not playing song
          else{
            isPlaying = false;
            $('img#martyFace').css({
              'animation-play-state':'paused'
            });
            if($('.muzieknootjes').css('display') != 'none'){
              $('.muzieknootjes').fadeOut();
            }
          }
        }
    });
  }

  function RefreshToken(){
    $.ajax({
      url: '/refresh_token',
      data: {
        'refresh_token': refresh_token
      }
    }).done(function(data) {
      access_token = data.access_token;
    });
  }

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var currentSong="";
  var currentArtist = "";

  var song=""; var artist = ""; var albumArt = "";

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {

      $('#login').hide();
      $('#container').show();

      fetchDetails();
      setInterval(fetchDetails, 10000);
      setInterval(RefreshToken, 3600000);
    } else {
      $('#container').fadeOut();
      // render initial screen
      $('#login').show();
      $('#container').hide();
    }
  }
})();
