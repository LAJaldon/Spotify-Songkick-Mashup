var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: 'clientId',
  clientSecret: 'clientsecret',
  redirectUri: 'http://localhost:3000/callback'
});

// Grants the user authorisation to access the Spotify endpoints
spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log("The access token expires in " + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function (err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
)

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Discover Music' });
});

/* GET - searches for artists based on user input */
router.get('/search', (req, res, next) => {
  const searchArtist = req.query;

  try {
    spotifyApi.searchArtists(searchArtist['artist']).then(
      function (data) {
        const body = data.body.artists.items;
        // grab the name of the artist the user entered 
        const inputEntered = searchArtist.artist;
        res.render('searchResult', { body, inputEntered });
      }
    )
      .catch((error) => {
        res.render('invalidQuery', error);
      })
  }
  catch {
    res.render('invalidQuery');
  }
});

/* GET - searches for artists whose music are similar to the artist that 
  the user typed */
router.get('/search/relatedartist', async function (req, res, next) {
  const query = req.query;

  /* async/await functionality is used since getRelatedArtists endpoint relies
    on the value returned from the searchArtists endpoint */
  try {
    const artistSearched = await spotifyApi.searchArtists(query['artist']).then(function (data) {
      artistID = data.body.artists.items[0].id;
      return artistID;
    });

    const findRelatedArtists = await spotifyApi.getArtistRelatedArtists(artistSearched).then(function (res) {
      data = res.body;
      return data;
    })

    res.render('relatedArtists', { findRelatedArtists });
  } catch {
    res.render('noRelatedArtists');
  }
});

/* GET - retrieves artist spotify details including tracks and albums */
router.get('/artist', async function (req, res, next) {
  const query = req.query;

  /* async/await functionality is used since all the endpoints relies
    on the value returned from the searchArtists endpoint */
  try {
    const artistId = await spotifyApi.searchArtists(query['artist']).then(function (res) {
      id = res.body.artists.items[0].id;
      return id;
    })

    const topTracks = await spotifyApi.getArtistTopTracks(artistId, 'AU').then(function (res) {
      return res;
    })

    const albums = await spotifyApi.getArtistAlbums(artistId).then(function (res) {
      return res;
    })

    const artistDetails = await spotifyApi.getArtist(artistId).then(function (data) {
      return data;
    })

    const tracks = topTracks.body.tracks
    const albumItems = albums.body.items
    // retrieve information about the artist's spotify details
    const body = artistDetails.body;
    const name = body.name;
    const followers = body.followers.total;
    const popularity = body.popularity;
    const genres = body.genres;
    // retrieves an array which has the artist's images
    const images = body.images;

    res.render('artistDetails', { name, followers, popularity, genres, images, tracks, albumItems })
  } catch {
    res.render('error');
  }
});

module.exports = router;
