var express = require('express');
const axios = require('axios');
var router = express.Router();
const apikey = 'songkick api key';

/* GET - retrieves details of an artist's upcoming events */
router.get('/:query', async function (req, res, next) {
    const query = req.params.query;
    const url = `https://api.songkick.com/api/3.0/search/artists.json?apikey=${apikey}&query=${query}`;

    /* async/await functionality is used since the second input relies
    in the first input to return the id of the artist searched */
    try {
        const artistId = await axios.get(url).then(function (res) {
            const data = res.data;

            // contains the json which has the id of the artist searched
            const id = data.resultsPage.results.artist[0].id;
            return id;
        });
        const artistEventUrl = `https://api.songkick.com/api/3.0/artists/${artistId}/calendar.json?apikey=${apikey}`

        const upcomingEvents = await axios.get(artistEventUrl).then(function (res) {
            // returning the json data which have the events page of the artist
            const data = res.data.resultsPage;
            return data;
        });
        res.render('upcomingEvents', { upcomingEvents, query });
    } catch {
        res.render('eventsNoResults', { query });
    }
});

module.exports = router;
