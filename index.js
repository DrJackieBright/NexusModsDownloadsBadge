const express = require('express')
const fetch = require('node-fetch')

const apiURL = "https://staticstats.nexusmods.com/live_download_counts/mods/"

const app = express();

app.get('/', async (req, res) => {
  let game = req.query.game
  let mod = req.query.mod
  if (!game || !mod) {
    res.status(400).send("<p>Bad Request: Missing game or mod id</p><p>Request should be in the format [domain]/?game=[game id]&mod=[mod id]</p>")
    return
  }
  try {
    let resp = await fetch(`${apiURL}/${game}.csv`)
    if (resp.status == 404) {
      res.status(400).send("Bad Request: Game not found")
      return
    }
    let body = await resp.text()
    let match = body.match(new RegExp(`\\D${mod},\\d+,\\d+,\\d+`))
    if (match == null) {
      res.status(400).send("Bad Request: Mod not found")
      return
    }
    let line = match[0].split(",")
    let data = {
      id: line[0],
      totalDownloads: line[1],
      uniqueDownloads: line[2],
      views: line[3]
    }
    let logo = await fetch("https://images.nexusmods.com/favicons/ReskinOrange/favicon.svg")
    res.send({
      "schemaVersion": 1,
      "logoSvg": await logo.text(),
      "label": "Downloads",
      "message": data.totalDownloads,
      "color": "orange"
    })
  } catch (err) {
    //console.log(req)
    console.error(err)
    res.sendStatus(500)
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('server started')
});